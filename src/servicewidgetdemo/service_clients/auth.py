from typing import Tuple

from servicewidgetdemo.lib.config import config
from servicewidgetdemo.lib.errors import ServiceError
from servicewidgetdemo.lib.responses import ErrorResponse
from servicewidgetdemo.lib.type import ServiceBaseModel
from servicewidgetdemo.service_clients.KBaseAuth import KBaseAuth, TokenInfo


def get_username(kbase_auth_token: str) -> str:
    auth = KBaseAuth(
        url=config().services.Auth2.url,
        cache_lifetime=int(config().services.Auth2.tokenCacheLifetime / 1000),
        cache_max_size=config().services.Auth2.tokenCacheMaxSize,
    )

    return auth.get_username(kbase_auth_token)


def ensure_authorization(authorization: str | None) -> Tuple[str, TokenInfo]:
    """
    Ensures that the "authorization" value, the KBase auth token, is
    not none. This is a convenience function for endpoints, whose sole
    purpose is to ensure that the provided token is good and valid.
    """
    if authorization is None:
        raise ServiceError(
            error=ErrorResponse[ServiceBaseModel](
                code="missingToken",
                title="Missing Token",
                message="API call requires a KBase auth token",
            ),
            status_code=401,
        )
    auth = KBaseAuth(
        url=config().services.Auth2.url,
        cache_lifetime=int(config().services.Auth2.tokenCacheLifetime / 1000),
        cache_max_size=config().services.Auth2.tokenCacheMaxSize,
    )
    return authorization, auth.get_token_info(authorization)
