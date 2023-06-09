"""
The main service entrypoint

The main module provides the sole entrypoint for the FastAPI application. It defines the top level "app",
and most interaction with the FastAPI app itself, such as exception handling overrides, application
metadata for documentation, incorporation of all routers supporting all endpoints, and a
sole endpoint implementing the online api documentation at "/docs".

All endpoints other than the /docs are implement as "routers". All routers are implemented in individual
modules within the "routers" directory. Each router should be associated with a top level path element, other
than "root", which implements top level endpoints (other than /docs).
Routers include: link, linking-sessions, works, orcid, and root.

"""
from typing import Any, Generic, List, TypeVar

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.staticfiles import StaticFiles
from pydantic import Field
from servicewidgetdemo.lib.config import config
from servicewidgetdemo.lib.errors import (
    FASTAPI_ERROR,
    NOT_FOUND,
    ServiceError,
    ServiceErrorX,
)
from servicewidgetdemo.lib.responses import (
    ErrorResponse,
    error_response,
    error_response2,
    exception_error_response,
)
from servicewidgetdemo.lib.runtime import global_runtime
from servicewidgetdemo.lib.type import ServiceBaseModel
from servicewidgetdemo.lib.utils import epoch_time_millis
from servicewidgetdemo.routers import root
from servicewidgetdemo.service_clients.KBaseAuth import (
    KBaseAuthError,
    KBaseAuthErrorInfo,
    KBaseAuthInvalidToken,
)

# from pydantic.error_wrappers import ErrorDict
from starlette import status
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import HTMLResponse, JSONResponse

###############################################################################
# FastAPI application setup
#
# Set up FastAPI top level app with associated metadata for documentation purposes.
#
###############################################################################

description = """\
The ServiceWidgetDemo is a KBase SDK-compatible dynamic service for demonstrating
the ability to provide widgets in a dynamic service.
"""

tags_metadata = [
    {"name": "misc", "description": "Miscellaneous operations"},
]

# TODO: add fancy FastAPI configuration https://fastapi.tiangolo.com/tutorial/metadata/
app = FastAPI(
    docs_url=None,
    redoc_url=None,
    title="Widget Demo Dynamic Service",
    description=description,
    terms_of_service="https://www.kbase.us/about/terms-and-conditions-v2/",
    contact={
        "name": "KBase, Lawrence Berkeley National Laboratory, DOE",
        "url": "https://www.kbase.us",
        "email": "engage@kbase.us",
    },
    license_info={
        "name": "The MIT License",
        "url": "https://github.com/kbase/kb_sdk/blob/develop/LICENSE.md",
    },
    openapi_tags=tags_metadata,
)


@app.on_event("startup")
async def startup_event() -> None:
    global_runtime.status = "started"
    global_runtime.start_time = epoch_time_millis()


###############################################################################
# Routers
#
# All paths are included here as routers. Each router is defined in the "routers" directory.
###############################################################################
app.include_router(root.router)

###############################################################################
#
# Exception handlers
#
#
###############################################################################

T = TypeVar("T", bound=ServiceBaseModel)


class WrappedError(ServiceBaseModel, Generic[T]):
    detail: T = Field(...)


class ValidationError(ServiceBaseModel):
    detail: List[Any] = Field(...)
    body: Any = Field(...)


#
# Custom exception handlers.
# Exceptions caught by FastAPI result in a variety of error responses, using
# a specific JSON format. However, we want to return all errors using our
# error format, which mimics JSON-RPC 2.0 and is compatible with the way
# our JSON-RPC 1.1 APIs operate (though not wrapped in an array).
#

# Have this return JSON in our "standard", or at least uniform, format. We don't
# want users of this api to need to accept FastAPI/Starlette error format.
# These errors are returned when the API is misused; they should not occur in production.
# Note that response validation errors are caught by FastAPI and converted to Internal Server
# errors. https://fastapi.tiangolo.com/tutorial/handling-errors/
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    data: ValidationError = ValidationError(detail=exc.errors(), body=exc.body)
    return error_response(
        "requestParametersInvalid",
        "Request Parameters Invalid",
        "This request does not comply with the schema for this endpoint",
        data=data,
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
    )


#
# We rely upon the auth client to raise this exception if a bad, invalid, expired token
# is used. Service endpoint handlers should not attempt to catch this exception.
# Note that we do not handle missing token errors. These are caught directly by
# service endpoint handlers as part of defensive programming practices.
#
@app.exception_handler(KBaseAuthInvalidToken)
async def kbase_auth_invalid_token_handler(
    request: Request, exc: KBaseAuthInvalidToken
) -> JSONResponse:
    data: WrappedError[KBaseAuthErrorInfo] = WrappedError[KBaseAuthErrorInfo](
        detail=exc.to_obj()
    )
    return error_response(
        "invalidToken",
        "Invalid KBase Token",
        "KBase auth token is invalid",
        data=data,
        status_code=status.HTTP_401_UNAUTHORIZED,
    )


#
# This covers all other potential auth errors. From experience other potential errors are
# very rare.
# See https://github.com/kbase/auth2/blob/master/src/us/kbase/auth2/lib/exceptions/ErrorType.java
#


class KBaseAuthErrorDetails(ServiceBaseModel):
    details: KBaseAuthErrorInfo


@app.exception_handler(KBaseAuthError)
async def kbase_auth_exception_handler(
    request: Request, exc: KBaseAuthError
) -> JSONResponse:
    # TODO: this should reflect the nature of the auth error,
    return error_response(
        "authError",
        "Error Authenticating KBase Token",
        "Unknown error authenticating with KBase",
        data=KBaseAuthErrorDetails(details=exc.to_obj()),
        status_code=status.HTTP_401_UNAUTHORIZED,
    )


#
# ServiceError is a generic wrapper around an ErrorResponse and status code, and can create
# its own error response dict.
#
@app.exception_handler(ServiceError)
async def service_error_exception_handler(
    _: Request, exc: ServiceError
) -> JSONResponse:
    return exc.get_response()


@app.exception_handler(ServiceErrorX)
async def service_errorx_exception_handler(
    _: Request, exc: ServiceErrorX
) -> JSONResponse:
    return exc.get_response()


#
# This catches good ol' internal server errors. These are primarily due to internal programming
# logic errors. The reason to catch them here is to override the default FastAPI
# error structure.
#
@app.exception_handler(500)
async def internal_server_error_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    return exception_error_response(
        "internalServerError",
        "Internal Server Error",
        exc,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


class StarletteHTTPDetailData(ServiceBaseModel):
    detail: Any = Field(...)


class StarletteHTTPNotFoundData(StarletteHTTPDetailData):
    path: str = Field(...)


#
# Finally there are some other errors thrown by FastAPI / Starlette which need overriding to return
# a normalized JSON form.
# This should be all of them.
# See: https://fastapi.tiangolo.com/tutorial/handling-errors/
#
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    if exc.status_code == 404:
        return error_response2(
            ErrorResponse[StarletteHTTPNotFoundData](
                code=NOT_FOUND.code,
                title=NOT_FOUND.title,
                message="The requested resource was not found",
                data=StarletteHTTPNotFoundData(
                    detail=exc.detail, path=request.url.path
                ),
            ),
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return error_response2(
        ErrorResponse[StarletteHTTPDetailData](
            code=FASTAPI_ERROR.code,
            title="FastAPI Error",
            message="Internal FastAPI Exception",
            data=StarletteHTTPDetailData(detail=exc.detail),
        ),
        status_code=exc.status_code,
    )
    # return error_response3(
    #
    # )


###############################################################################
#
# API
#
###############################################################################


##
# /status - The status of the service.
#

# Also, most services and all KB-SDK apps have a /status endpoint.
# As a side benefit, it also returns non-private configuration.
# TODO: perhaps non-private configuration should be accessible via an
# "/info" endpoint.
#


@app.get(
    "/docs",
    response_class=HTMLResponse,
    include_in_schema=True,
    tags=["misc"],
    responses={
        200: {
            "description": "Successfully returned the api docs",
        },
        404: {"description": "Not Found"},
    },
)
async def docs(req: Request) -> HTMLResponse:
    """
    Get API Documentation

    Provides a web interface to the auto-generated API docs.
    """
    if app.openapi_url is None:
        # FastAPI is obstinate - I initially wanted to handle this case
        # with a "redirect error" to kbase-ui, but even though I returned
        # 302, it resulted in a 404 in tests! I don't know about real life.
        # So lets just make this a 404, which is reasonable in any case.
        # return error_response_not_found("The 'openapi_url' is 'None'")
        return HTMLResponse(
            content="<h1>Not Found</h1><p>Sorry, the openapi url is not defined</p>",
            status_code=404,
        )

    openapi_url = config().services.ServiceWidgetDemo.url + app.openapi_url
    return get_swagger_ui_html(
        openapi_url=openapi_url,
        title="API",
    )


app.mount(
    "/widgets/status", StaticFiles(directory="widgets/status", html=True), name="status"
)
app.mount("/widgets/pdb", StaticFiles(directory="widgets/pdb", html=True), name="pdb")
# app.mount("/widgets/pdb", StaticFiles(directory="widgets/pdb/react-app/build", html=True), name="pdb2")
app.mount(
    "/widgets/workspace-status",
    StaticFiles(directory="widgets/workspace-status", html=True),
    name="workspace-status",
)
# app.mount("/widgets/info", StaticFiles(directory="widgets/info"), name="info")
