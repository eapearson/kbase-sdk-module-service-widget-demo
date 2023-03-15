#!/bin/bash

# if [ -f ./work/token ] ; then
#   export KB_AUTH_TOKEN=$(<./work/token)
# fi

# The first, and only, optional argument is used to dispatch to the appropriate action
# below. Note that "no argument" means to run the server.

if [ $# -eq 0 ] ; then
  # Starts the server
  scripts/deploy/start-server.sh
elif [ "${1}" = "serve" ] ; then
  # Starts the server
  scripts/deploy/start-server.sh
elif [ "${1}" = "test" ] ; then
  # Run Tests
  echo "Run Tests"
  echo "TODO: This is not how I want to want to run tests, in the service image"
  # ./Taskfile test
elif [ "${1}" = "init" ] ; then
  # Initialize the module
  # I don't know what this is supposed to do, or when it is run.
  # TODO: investigate!
  echo "Initialize module"
  echo "There is nothing to initialize"
elif [ "${1}" = "bash" ] ; then
  # Provide a bash command line interface inside the service container
  bash
elif [ "${1}" = "report" ] ; then
  # Simply copies the dummy compilation report to the expected location.
  echo "report task running in ${PWD}"
  ls -ltra
  cp ./sdk-compat/compile_report.json ./work/compile_report.json
  echo "Compilation Report copied to ./work/compile_report.json"
else
  echo "Unknown entrypoint option: ${1}"
  exit 1
fi
