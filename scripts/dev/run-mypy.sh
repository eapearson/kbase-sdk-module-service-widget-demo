#!/bin/bash
echo "* Running mypy."
mypy
result_code=$?
if [[ $result_code -gt 0 ]]; then
  echo
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo "! mypy found errors.                              "
  echo "! please address the errors, then run mypy again. "
  echo "! Good Luck!                                      "
  echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
  echo
else
  echo
  echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
  echo "> mypy finished successfully "
  echo "> Good to Go!                "
  echo ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
  echo
fi
exit $result_code
