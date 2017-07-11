#!/usr/bin/env bash

# Please Use Google Shell Style: https://google.github.io/styleguide/shell.xml

# ---- Start unofficial bash strict mode boilerplate
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -o errexit    # always exit on error
set -o errtrace   # trap errors in functions as well
set -o pipefail   # don't ignore exit codes when piping output
set -o posix      # more strict failures in subshells
# set -x          # enable debugging

IFS="$(printf "\n\t")"
# ---- End unofficial bash strict mode boilerplate

cd "$(dirname "$0")/.."
readonly action="${1-plan}"
find "code" -type f -name '*-tf.js' | {
  while IFS= read -r file_path
  do
    out_name="$(basename "${file_path}" -tf.js).tf.json"
    out_path="terraform/${out_name}"
    echo -n "building ${out_path}…"
    node "${file_path}" > "${out_path}"
    echo "✓"
  done
}
echo "Running terraform ${action}"
(cd "terraform" && terraform "${action}")
