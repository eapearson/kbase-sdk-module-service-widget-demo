#!/bin/bash

# Create the configuration file before starting the service.
# TODO: should this be out of scope for this file?f
scripts/deploy/render-config.sh

# Move into the service directory, which is where ALL runtime files should be.
cd service

export MODULE_DIR="${PWD}"

exit_code=$?
if [ $exit_code != 0 ]; then
  echo "Error ${exit_code} encountered rendering the service configuration, NOT STARTING SERVER"
  exit 1
fi

echo "Running in DEV mode; server will reload when source changes"
poetry run uvicorn servicewidgetdemo.main:app --reload --reload-dir /kb/module/src --host 0.0.0.0 --port 5000
