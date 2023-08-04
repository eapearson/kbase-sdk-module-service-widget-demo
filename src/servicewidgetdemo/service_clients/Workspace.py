import json
import uuid
from typing import Any, Optional

import httpx


class ServiceError(Exception):
    def __init__(self, message: str, status_code: int, error: Any):
        super().__init__(self, message)
        self.status_code = status_code
        self.error = error


class JSONRPC11Service:
    def __init__(self, module: str, url: str, timeout: int, token: Optional[str]):
        self.module = module
        self.url = url
        self.timeout = timeout
        self.token = token

    def rpc_call(self, method: str, params: Any) -> Any:
        headers = {"accept": "application/json", "content-type": "application/json"}
        if self.token is not None:
            headers["authorization"] = self.token

        response = httpx.post(
            self.url,
            headers=headers,
            content=json.dumps(
                {
                    "version": "1.1",
                    "id": str(uuid.uuid4()),
                    "method": f"{self.module}.{method}",
                    "params": [params],
                }
            ),
        )

        try:
            result = json.loads(response.text)
        except Exception as ex:
            raise ServiceError(
                message="Cannot parse respnose as JSON",
                status_code=0,
                error={"message": str(ex)},
            )

        if response.status_code == 200:
            return result["result"][0]

        raise ServiceError(
            message=result["error"]["message"],
            status_code=response.status_code,
            error=result["error"],
        )


class Workspace(JSONRPC11Service):
    def __init__(self, url: str, timeout: int, token: str | None = None):
        super().__init__("Workspace", url, timeout, token)

    def get_object(self, ref: str) -> Any:
        params = {"objects": [{"ref": ref}]}
        result = self.rpc_call("get_objects2", params)
        return result["data"][0]

    def get_object_info(self, ref: str) -> Any:
        params = {"objects": [{"ref": ref}]}
        result = self.rpc_call("get_object_info3", params)
        return result["infos"][0]

    def can_access_object(self, ref: str) -> bool:
        params = {"objects": [{"ref": ref}]}
        try:
            self.rpc_call("get_object_info3", params)
            return True
        except ServiceError as se:
            print(str(se))
            return False
