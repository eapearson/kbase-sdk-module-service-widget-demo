"""
Contains the data model for the application

Most application types used by router implementation should be located here. This
essentially represents the data model for the application. This insulates us from
the vagaries of the upstream APIs, and provides a consistent system of types,
naming conventions, etc.

All types inherit from pydantic's BaseModel, meaning that they will have bidirectional
JSON support, auto-documentation, the opportunity for more detailed schemas and
documentation.

"""

from typing import List, Optional, Union

from pydantic import Field
from servicewidgetdemo.lib.type import ServiceBaseModel


class SimpleSuccess(ServiceBaseModel):
    ok: bool = Field(...)


# Config


class ServiceDescription(ServiceBaseModel):
    name: str = Field(min_length=2, max_length=50)
    title: str = Field(min_length=5, max_length=100)
    language: str = Field(min_length=1, max_length=50)
    description: str = Field(min_length=50, max_length=4000)


# API


class JSONDecodeErrorData(ServiceBaseModel):
    status_code: int = Field(alias="status-code")
    error: str = Field(...)


class UnknownError(ServiceBaseModel):
    exception: str = Field(...)
