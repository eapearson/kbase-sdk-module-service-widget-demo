#!/bin/bash

# Create the configuration file before starting the service.
# TODO: should this be out of scope for this file?f
set -E
mkdir -p deploy
jinja render \
  -t etc/config.toml.jinja \
  -o deploy/config.toml \
  -e KBASE_ENDPOINT="${KBASE_ENDPOINT:?Required environment variable KBASE_ENDPOINT absent or empty}"

# Move into the service directory, which is where ALL runtime files should be.
#cd service

export MODULE_DIR="${PWD}"

exit_code=$?
if [ $exit_code != 0 ]; then
  echo "Error ${exit_code} encountered rendering the service configuration, NOT STARTING SERVER"
  exit 1
fi

echo "Running in DEV mode; server will reload when source changes"
poetry run uvicorn servicewidgetdemo.main:app --reload --reload-dir /kb/module/src --host 0.0.0.0 --port 5000
