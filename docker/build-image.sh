#!/usr/bin/env bash
cd "$(dirname "$0")"
source ../bin/lib/strict-mode.sh
docker build --build-arg NODE_VERSION="$(cat ../.nvmrc)" --tag hexagonal-lambda .
