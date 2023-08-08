from datetime import datetime, timezone
from test.mocks.data import load_data_file, load_data_json
import os
import pytest
from fastapi.testclient import TestClient
from unittest import mock
from servicewidgetdemo.main import app

client = TestClient(app, raise_server_exceptions=False)

config_yaml = load_data_file("config1.toml")
gitinfo_toml = load_data_file("git_info1.toml")


@pytest.fixture
def fake_fs(fs):
    fs.add_real_directory("/kb/module/test/data")
    yield fs


# Happy paths

#
# Note that the status should reflect that the service has started ...
# but it looks like the test client can't be used to simulate the
# service lifetime events. The "status" below is driven by the
# fastapi app lifecycle events.
#
TEST_ENV = {
    "KBASE_ENDPOINT": f"http://foo/services/",
    "MODULE_DIR": os.environ.get("MODULE_DIR"),
}


@mock.patch.dict(os.environ, TEST_ENV, clear=True)
def test_main_status(fake_fs):
    response = client.get("/status")
    assert response.status_code == 200
    json_response = response.json()
    assert json_response["status"] == "initial"  # TODO: should be "started"
    assert isinstance(json_response["time"], int)
    assert json_response["start_time"] is None  # TODO: should be int
    # assert isinstance(json_response["start_time"], None) # TODO: should be int
    status_time = datetime.fromtimestamp(json_response["time"] / 1000, tz=timezone.utc)
    current_time = datetime.now(timezone.utc)
    time_diff = current_time - status_time
    assert abs(time_diff.total_seconds()) < 1
