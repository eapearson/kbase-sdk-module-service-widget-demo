"""
Configuration support for this service

A KBase service requires at least a minimal, and often substantial, configuration in order to operate.
Some configuration, like the base url for services, differs between each KBase environment.
Other configuration represents information that may change over time, such as urls.
Sill other configuration data contains private information like credentials, which must be well controlled.

Because configuration is needed throughout the service's code, it is provided by means of a module variable
which is populated when the module is first loaded.
"""
import os
from typing import Optional
from urllib.parse import urljoin, urlparse

from pydantic import Field
from servicewidgetdemo.lib.type import ServiceBaseModel


class GitInfo(ServiceBaseModel):
    commit_hash: str = Field(...)
    commit_hash_abbreviated: str = Field(...)
    author_name: str = Field(...)
    author_date: int = Field(...)
    committer_name: str = Field(...)
    committer_date: int = Field(...)
    url: str = Field(...)
    branch: str = Field(...)
    tag: Optional[str] = Field(default=None)


class ServiceDefault(ServiceBaseModel):
    path: str = Field(...)
    env_name: str = Field(...)


class ServiceDefaults(ServiceBaseModel):
    auth2: ServiceDefault = Field(...)
    workspace: ServiceDefault = Field(...)


SERVICE_DEFAULTS = ServiceDefaults(
    auth2=ServiceDefault(path="auth", env_name="KBASE_SERVICE_AUTH"),
    workspace=ServiceDefault(path="ws", env_name="KBASE_SERVICE_WORKSPACE"),
)


class ConstantDefault(ServiceBaseModel):
    value: int = Field(...)
    env_name: str = Field(...)


class ConstantDefaults(ServiceBaseModel):
    token_cache_lifetime: ConstantDefault = Field(...)
    token_cache_max_items: ConstantDefault = Field(...)
    request_timeout: ConstantDefault = Field(...)


CONSTANT_DEFAULTS = ConstantDefaults(
    token_cache_lifetime=ConstantDefault(value=300, env_name="TOKEN_CACHE_LIFETIME"),
    token_cache_max_items=ConstantDefault(
        value=20000, env_name="TOKEN_CACHE_MAX_ITEMS"
    ),
    request_timeout=ConstantDefault(value=60, env_name="REQUEST_TIMEOUT"),
)


class Config2:
    kbase_endpoint: str

    def __init__(self) -> None:
        kbase_endpoint = os.environ.get("KBASE_ENDPOINT")
        if kbase_endpoint is None or len(kbase_endpoint) == 0:
            raise ValueError('The "KBASE_ENDPOINT" environment variable was not found')
        self.kbase_endpoint = kbase_endpoint

    def get_service_url(self, service_default: ServiceDefault) -> str:
        env_path = os.environ.get(service_default.env_name)
        path = env_path or service_default.path
        return urljoin(self.kbase_endpoint, path)

    def get_auth_url(self) -> str:
        return self.get_service_url(SERVICE_DEFAULTS.auth2)

    def get_workspace_url(self) -> str:
        return self.get_service_url(SERVICE_DEFAULTS.workspace)

    # MORE...

    # Configurable constants

    @staticmethod
    def get_constant(constant_default: ConstantDefault) -> int:
        value = os.environ.get(constant_default.env_name)
        if value is not None:
            return int(value)

        return constant_default.value

    def get_cache_lifetime(self) -> int:
        return self.get_constant(CONSTANT_DEFAULTS.token_cache_lifetime)

    def get_cache_max_items(self) -> int:
        return self.get_constant(CONSTANT_DEFAULTS.token_cache_max_items)

    def get_request_timeout(self) -> int:
        return self.get_constant(CONSTANT_DEFAULTS.request_timeout)

    # misc

    def get_ui_origin(self) -> str:
        endpoint_url = urlparse(self.kbase_endpoint)
        # [protocol, _, endpoint_host] = self.kbase_endpoint.split('/')[2]
        host = (
            "narrative.kbase.us"
            if endpoint_url.hostname == "kbase.us"
            else endpoint_url.netloc
        )
        return f"{endpoint_url.scheme}://{endpoint_url.hostname}"
