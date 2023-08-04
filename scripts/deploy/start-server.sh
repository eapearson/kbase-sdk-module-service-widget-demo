#!/bin/bash


# Render runtime config file
set -E
#mkdir -p service/deploy
jinja render \
  -t etc/config.toml.jinja \
  -o service/deploy/config.toml \
  -e KBASE_ENDPOINT="${KBASE_ENDPOINT:?Required environment variable KBASE_ENDPOINT absent or empty}"

exit_code=$?
if [ $exit_code != 0 ]; then
  echo "Error ${exit_code} encountered rendering the service configuration, NOT STARTING SERVER"
  exit 1
fi


# Move into the service directory, which is where ALL runtime files should be.
cd service

export MODULE_DIR="${PWD}"
export PYTHONPATH="${PWD}"

echo "Running in PROD mode; server will NOT reload when source changes"
poetry run uvicorn servicewidgetdemo.main:app --host 0.0.0.0 --port 5000
