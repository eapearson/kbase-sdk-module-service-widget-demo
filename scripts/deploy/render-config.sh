#!/bin/bash

set -E
mkdir -p deploy
jinja render \
  -t etc/config.toml.jinja \
  -o service/deploy/config.toml \
  -e KBASE_ENDPOINT="${KBASE_ENDPOINT:?Required environment variable KBASE_ENDPOINT absent or empty}"