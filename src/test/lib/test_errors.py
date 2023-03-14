import pytest
from servicewidgetdemo.lib import errors


def test_internal_server_error():
    with pytest.raises(errors.InternalError) as ie:
        raise errors.InternalError("Hello, I'm an internal error", data={"foo": "bar"})
    exception = ie.value
    assert exception.status_code == 500
    assert exception.code == "internalError"
    assert exception.message == "Hello, I'm an internal error"
    assert exception.data["foo"] == "bar"
