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

# Script has 2 modes
# For simple local builds, consistent filenames go in .build. Easy. Done.
#  - This runs by default with STAMP empty
# For S3 archived builds, artifacts go into a timestamp directory
#  - Activate this mode by setting STAMP to a timestamp

if [[ -n "${STAMP}" ]]; then
  stamp_dir=".build/${STAMP}"
else
  stamp_dir=
  # Set a timestamp for the build info file, but simple artifact path
  STAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
fi

cd "$(dirname "$0")/.."
PATH="$(npm bin):${PATH}"

webpack

info_path=".build/build-info.txt"
cat <<EOF >"${info_path}"
commit: $(git rev-parse HEAD)
branch: $(git rev-parse --abbrev-ref HEAD)
tags: $(git log -n1 --pretty=format:%d)
timestamp: ${STAMP}
EOF

if [[ -n "${stamp_dir}" ]]; then
  mkdir -p "${stamp_dir}"
fi

for lambda_js_path in "$@"; do
  lambda_name="$(basename "${lambda_js_path}" -lambda.js)"
  bundle_path=".build/${lambda_name}.js"
  if [[ -n "${stamp_dir}" ]]; then
    zip_path="${stamp_dir}/${lambda_name}.zip"
  else
    zip_path=".build/${lambda_name}.zip"
  fi
  zip --quiet --junk-paths "${zip_path}" "${bundle_path}" "${info_path}"
  echo "✓ ${zip_path}"
done
