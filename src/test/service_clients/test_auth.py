from test.lib.test_responses import mock_services
from test.mocks.data import load_data_file
from test.mocks.mock_contexts import mock_auth_service, no_stderr

import pytest
from servicewidgetdemo.lib.errors import ServiceError
from servicewidgetdemo.service_clients import auth
from servicewidgetdemo.service_clients.auth import ensure_authorization
from servicewidgetdemo.service_clients.KBaseAuth import TokenInfo

config_yaml = load_data_file("config1.toml")


@pytest.fixture
def fake_fs(fs):
    fs.create_file("/kb/module/deploy/config.toml", contents=config_yaml)
    fs.add_real_directory("/kb/module/test/data")
    yield fs


def test_auth_get_username(fake_fs):
    with no_stderr():
        with mock_auth_service():
            assert auth.get_username("foo") == "foo"


def test_ensure_authorization():
    with mock_services():
        authorization, value = ensure_authorization("foo")
        assert isinstance(authorization, str)
        assert authorization == "foo"
        assert isinstance(value, TokenInfo)

    with pytest.raises(
        ServiceError, match="API call requires a KBase auth token"
    ) as ex:
        ensure_authorization(None)
