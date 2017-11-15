#!/usr/bin/env bash

# Please Use Google Shell Style: https://google.github.io/styleguide/shell.xml

# ---- Start unofficial bash strict mode boilerplate
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -o errexit  # always exit on error
set -o errtrace # trap errors in functions as well
set -o pipefail # don't ignore exit codes when piping output
set -o posix    # more strict failures in subshells
# set -x          # enable debugging

IFS="$(printf "\n\t")"
# ---- End unofficial bash strict mode boilerplate

debug() {
  if [[ "${RUN_PASS_DEBUG}" != "yes" ]]; then
    return
  fi
  echo "✓ " "$@"
}

bail() {
  local exit_code
  exit_code=$1
  # Print all remaining arguments to stderr
  shift
  echo "$@" 1>&2
  exit ${exit_code}
}

check_pass_is_installed() {
  set +e # disable bail on non-zero exit code for 1 command
  pass --version &>/dev/null
  if [[ $? -ne 0 ]]; then
    bail 10 "Please install pass: https://www.passwordstore.org/"
  fi
  set -e # re-enable
}

check_pass_env_is_set() {
  # validate we know which credentials we are supposed to use
  if [[ -z ${PASS_ENV} ]]; then
    bail 11 "Set PASS_ENV env var first"
  fi
}

credentials_are_stale() {
  if [[ -z "${AWS_EXPIRATION}" ]]; then
    debug "temporary credentials not in password store"
    return 0
  fi
  # AWS_EXPIRATION='2017-11-13T22:39:15Z'
  now=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  if [[ "${AWS_EXPIRATION-0}" < "${now}" ]]; then
    debug "temporary credentials are expired"
    return 0
  fi
  debug "temporary credentials are fresh"
  return 1
}

check_permanent_credentials() {
  case "${AWS_ACCESS_KEY_ID}" in
    AK*) ;;

    *)
      bail "AWS_ACCESS_KEY_ID should begin with AK"
      ;;
  esac
  if [[ -z "${AWS_SECRET_ACCESS_KEY}" ]]; then
    bail "AWS_SECRET_ACCESS_KEY not set in permanent credentials"
  fi
  if [[ -z "${AWS_MFA_SERIAL}" ]]; then
    bail "AWS_MFA_SERIAL not set in permanent credentials"
  fi
}

main() {
  debug "$0 starting with pid $$"
  check_pass_is_installed
  debug "pass is installed"
  check_pass_env_is_set
  debug "PASS_ENV is: ${PASS_ENV}"

  local pass_name
  pass_name="${PASS_ENV}-session"
  # The temporary credentials are kept in a separate pass file
  # read in the temporary credentials, ignore error if not found, it's OK
  local temp_creds_snippet
  temp_creds_snippet="$(
    pass "${pass_name}" 2>/dev/null
    echo
  )"
  eval ${temp_creds_snippet}

  if credentials_are_stale; then
    # read in the permanent credentials so we can generate fresh temp creds
    eval "$(
      pass "${PASS_ENV}"
      echo
    )"
    check_permanent_credentials
    echo -n "MFA code: "
    read -n 6 token_code
    echo
    # this interferes with the get-session-token call
    # shellcheck disable=SC2034
    AWS_SESSION_TOKEN=''
    debug "getting a fresh session token from AWS"
    # this spits them out as whitespace delimited
    sts=$(aws sts get-session-token \
      --query 'Credentials.[AccessKeyId,SecretAccessKey,SessionToken,Expiration]' \
      --output text \
      --serial-number "${AWS_MFA_SERIAL}" \
      --token-code "${token_code}")
    # load the temp creds into the current process envirnoment
    access_key_id=$(echo "${sts}" | awk '{print $1}')
    secret_access_key=$(echo "${sts}" | awk '{print $2}')
    session_token=$(echo "${sts}" | awk '{print $3}')
    expiration=$(echo "${sts}" | awk '{print $4}')
    temp_creds_snippet=$(
      cat <<EOF
export AWS_ACCESS_KEY_ID='${access_key_id}'
export AWS_SECRET_ACCESS_KEY='${secret_access_key}'
export AWS_SESSION_TOKEN='${session_token}'
export AWS_EXPIRATION='${expiration}'
EOF
    )
    # Save our fresh temp creds into the password store
    debug "Saving fresh temporary credentials to the password store"
    echo "${temp_creds_snippet}" | pass insert -m "${pass_name}" >/dev/null
  fi
  debug "loading secrets"
  eval "$(
    pass "${PASS_ENV}"
    echo
  )"
  debug "combining application secrets with temporary credentials"
  eval ${temp_creds_snippet}
  debug "executing subprocess with temporary credentials and secrets"
  exec "$@"
}

main "$@"
