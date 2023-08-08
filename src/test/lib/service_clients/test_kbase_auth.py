import contextlib

import pytest
from servicewidgetdemo.lib.service_clients.kbase_auth import (
    KBaseAuth,
    KBaseAuthError,
    TokenInfo,
)
from test.mocks.mock_contexts import mock_auth_service, no_stderr

# Test parameters
SERVICE_PORT = 9999


@contextlib.contextmanager
def mock_services():
    with no_stderr():
        with mock_auth_service(SERVICE_PORT) as [_, _, url]:
            yield url


#
# Auth Client
#


def test_kbase_auth_constructor_minimal():
    client = KBaseAuth(url="foo", timeout=1, cache_max_items=1, cache_lifetime=1)
    assert client is not None


def test_kbase_auth_get_token_info():
    with mock_services() as url:
        client = KBaseAuth(url=url, timeout=1, cache_max_items=3, cache_lifetime=3)
        assert client is not None
        client.cache.clear()

        # First fetch of token from service
        token_info = client.get_token_info("foo")
        assert isinstance(token_info, TokenInfo)
        assert token_info.user == "foo"

        # Second should come from the cache. Let's test this by
        # killing the service!
        # TODO: service can have something measurable, like a call count.
        token_info = client.get_token_info("foo")
        assert isinstance(token_info, TokenInfo)
        assert token_info.user == "foo"


def test_kbase_auth_get_token_info_other_error():
    with mock_services() as url:
        client = KBaseAuth(url=url, timeout=1, cache_max_items=3, cache_lifetime=3)
        assert client is not None
        client.cache.clear()

        # First fetch of token from service
        with pytest.raises(KBaseAuthError):
            client.get_token_info("exception")


def test_kbase_auth_get_token_info_internal_error():
    with mock_services() as url:
        client = KBaseAuth(url=url, timeout=1, cache_max_items=3, cache_lifetime=3)
        assert client is not None
        client.cache.clear()

        # The call should trigger a JSON decode error, since this mimics
        # an actual, unexpected, unhandled error response with a text
        # body.
        with pytest.raises(KBaseAuthError):
            client.get_token_info("internal_server_error")


def test_kbase_auth_get_token_info_no_token():
    """
    We can't actually replicate a "no token" error, as we defend around that
    condition, but we can simulate it with the special token "no_token" set up
    in the mock auth service.
    """
    with mock_services() as url:
        client = KBaseAuth(url=url, timeout=1, cache_max_items=3, cache_lifetime=3)
        assert client is not None
        client.cache.clear()

        # The call should trigger a JSON decode error, since this mimics
        # an actual, unexpected, unhandled error response with a text
        # body.
        with pytest.raises(KBaseAuthError, match="Auth Service Error") as kae:
            client.get_token_info("no_token")

        error = kae.value.to_obj()
        assert error.code == 10010
        assert error.message == "Auth Service Error"
        assert (
            error.original_message
            == "10010 No authentication token: No user token provided"
        )


def test_kbase_auth_get_token_info_param_errors():
    client = KBaseAuth(
        url="http://foo/services/auth",
        timeout=1,
        cache_max_items=1,
        cache_lifetime=1,
    )
    assert client is not None
    with pytest.raises(TypeError) as e:
        client.get_token_info("")
