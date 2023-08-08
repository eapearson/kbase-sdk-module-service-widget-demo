import os
from unittest import mock

import pytest
from servicewidgetdemo.lib import auth
from servicewidgetdemo.lib.service_clients.kbase_auth import TokenInfo
from test.mocks.mock_contexts import mock_auth_service, no_stderr


@pytest.fixture
def fake_fs(fs):
    fs.add_real_directory("/kb/module/test/f")
    yield fs


MOCK_PORT = 9999

TEST_ENV = {
    "KBASE_ENDPOINT": f"http://127.0.0.1:{MOCK_PORT}/services/",
    "MODULE_DIR": os.environ.get("MODULE_DIR"),
}


@mock.patch.dict(os.environ, TEST_ENV, clear=True)
def test_endpoint():
    endpoint = os.environ.get("KBASE_ENDPOINT")
    assert endpoint is not None


@mock.patch.dict(os.environ, TEST_ENV, clear=True)
def test_auth_get_username():
    with no_stderr():
        with mock_auth_service(MOCK_PORT):
            assert auth.get_username("foo") == "foo"


@mock.patch.dict(os.environ, TEST_ENV, clear=True)
def test_ensure_authorization_cookie():
    with no_stderr():
        with mock_auth_service(MOCK_PORT):
            authorization, value = auth.ensure_authorization_cookie("foo", None)
            assert isinstance(authorization, str)
            assert authorization == "foo"
            assert isinstance(value, TokenInfo)

    with pytest.raises(Exception, match="Authorization required") as ex:
        auth.ensure_authorization_cookie(None, None)

    with pytest.raises(Exception, match="Authorization required") as ex:
        auth.ensure_authorization_cookie("", None)

    with pytest.raises(Exception, match="Authorization required") as ex:
        auth.ensure_authorization_cookie(None, "")

    with pytest.raises(Exception, match="Authorization required") as ex:
        auth.ensure_authorization_cookie("", "")


@mock.patch.dict(os.environ, TEST_ENV, clear=True)
def test_ensure_authorization():
    with no_stderr():
        with mock_auth_service(MOCK_PORT):
            authorization, value = auth.ensure_authorization("foo")
            assert isinstance(authorization, str)
            assert authorization == "foo"
            assert isinstance(value, TokenInfo)

    with pytest.raises(Exception, match="Authorization required") as ex:
        auth.ensure_authorization(None)

    with pytest.raises(Exception, match="Authorization required") as ex:
        auth.ensure_authorization("")
