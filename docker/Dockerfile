ARG NODE_VERSION
FROM mhart/alpine-node:${NODE_VERSION}
ARG TERRAFORM_VERSION=0.11.7
ARG AWS_CLI_VERSION=1.15.21
ENV TERRAFORM_VERSION ${TERRAFORM_VERSION}
ENV AWS_CLI_VERSION ${AWS_CLI_VERSION}
RUN apk -v --update add \
    bash \
    ca-certificates \
    groff \
    less \
    mailcap \
    openssl \
    py-pip \
    python \
    zip \
    && \
    pip install --upgrade awscli==${AWS_CLI_VERSION} && \
    # apk -v --purge del py-pip && \
    rm /var/cache/apk/*
RUN cd /tmp && \
    wget --quiet "https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip" && \
    unzip --quiet -d /usr/local/bin terraform_*.zip
VOLUME /opt
WORKDIR /opt
CMD ["npm", "run", "build"]
