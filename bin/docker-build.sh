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

cd "$(dirname "${BASH_SOURCE[0]}")/.."
project="$(basename "${PWD}")"
# The backslash escaped variables below are so bash doesn't immediately
# replace them with their environment variable values before passing to docker
dockerfile=$(
  cat <<EOF
FROM mhart/alpine-node:$(cat .nvmrc)
ARG TERRAFORM_VERSION=0.11.7
ARG AWS_CLI_VERSION=1.15.21
  ARG USER
  ARG USER_ID=1000
  ARG GROUP_ID=1000
ENV TERRAFORM_VERSION \${TERRAFORM_VERSION}
ENV AWS_CLI_VERSION \${AWS_CLI_VERSION}
ENV PATH /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/opt/node_modules/.bin
RUN set -eux; apk -v --update add \
        bash \
        ca-certificates \
        groff \
        less \
        mailcap \
        openssl \
        py-pip \
        python \
        zip; \
    pip install --upgrade awscli==\${AWS_CLI_VERSION}; \
    # apk -v --purge del py-pip && \
    rm /var/cache/apk/*;
RUN set -eux; cd /tmp; \
    wget -q "https://releases.hashicorp.com/terraform/\${TERRAFORM_VERSION}/terraform_\${TERRAFORM_VERSION}_linux_amd64.zip"; \
    unzip -q -d /usr/local/bin terraform_*.zip
VOLUME /opt
WORKDIR /opt
RUN addgroup -g \${GROUP_ID} \${USER}; \
  adduser -D -G "\${USER}" -u "\${USER_ID}" -g "\${USER}" "\${USER}";
USER \${USER}
CMD ["bash"]
EOF
)
echo "${dockerfile}" | docker build \
  --tag "${project}" \
  --build-arg "USER=${USER}" \
  --build-arg "USER_ID=$(id -u)" \
  --build-arg "GROUP_ID=$(id -g)" \
  -
