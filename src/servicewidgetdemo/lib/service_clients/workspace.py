import requests
import json
from typing import Any, Tuple


def parse_workspace_ref(ref: str) -> Tuple[int, int, int]:
    wsid, objid, ver = ref.split('/')
    return int(wsid), int(objid), int(ver)

class Service:
    def __init__(self, url: str, module: str, token: str = None):
        self.url = url
        self.module = module
        self.token = token

    def call_func(self, func_name: str, params: Any):
        call_params = []
        if params is not None:
            call_params.append(params)

        headers = {'Content-Type': 'application/json'}
        if self.token is not None:
            headers['Authorization'] = self.token

        try:
            rpc_call = {
                'version': '1.1',
                "id": "123",
                'method': f'{self.module}.{func_name}',
                'params': call_params
            }
            response = requests.post(self.url, headers=headers, json=rpc_call)
        # except OSError as ose:
        #     raise Exception(f'Call to {func_name} failed: {str(ose)}')
        except Exception as ex:
            raise Exception(f'Call to {func_name} failed with unknown exception: {str(ex)}')

        try:
            rpc_response = response.json()
        except json.JSONDecodeError as jsonde:
            raise Exception(f'Did not receive proper json response: {str(jsonde)}')
        if response.status_code != 200:
            return None, rpc_response.get('error')

        result = rpc_response.get('result')
        if result is None:
            return None

        return result[0], None


def object_info_to_dict( object_info: list) -> dict:
    [object_id, object_name, type_id,
     save_date, version, saved_by,
     workspace_id, workspace_name,
     checksum, size, metadata] = object_info
    return {
        'object_id': object_id,
        'object_name': object_name,
        'type': type_id,
        'saved_at': save_date,
        'saved_by': saved_by,
        'object_version': version,
        'workspace_id': workspace_id,
        'workspace_name': workspace_name,
        'checksum': checksum,
        'size': size,
        'metadata': metadata
    }

def workspace_info_to_dict( object_info: list) -> dict:
    [workspace_id, workspace_name,
     owner, modified_at, max_object_id, user_permission, global_permission,
     lock_status, metadata] = object_info
    return {
        'workspace_id': workspace_id,
        'workspace_name': workspace_name,
        'owner': owner,
        'modified_at': modified_at,
        'max_object_id': max_object_id,
        'user_permission': user_permission,
        'global_permission': global_permission,
        'lock_status': lock_status,
        'metadata': metadata
    }


class WorkspaceService(Service):
    def __init__(self, url, **kwargs):
        super().__init__(url, 'Workspace', **kwargs)
    def get_status(self):
        result, error = self.call_func('status', None)
        return result

    def get_object_info(self, ref: str):
        result, error = self.call_func(
            'get_object_info3',
            {
                'objects': [{
                    'ref': ref
                }],
                'includeMetadata': 1,
                'ignoreErrors': 0
            })
        if error is not None:
            raise Exception(f'Error fetching object info: {error.get("message")}')
        object_info = result['infos'][0]
        return object_info_to_dict(object_info)

    def get_workspace_info(self, workspace_id: int) -> dict:
        result, error = self.call_func(
            'get_workspace_info',
            {
              'id': workspace_id
            })
        if error is not None:
            raise Exception(f'Error fetching workspace info: {error.get("message")}')
        return workspace_info_to_dict(result)

    def get_object(self, ref: str):
        result, error = self.call_func(
            'get_objects2',
            {
                'objects': [{
                    'ref': ref
                }],
                'ignoreErrors': 0,
                'no_data': 0,
                'skip_external_system_updates': 0,
                'batch_external_system_updates': 0
            })
        if error is not None:
            raise Exception(f'Error fetching object info: {error.get("message")}')

        workspace_object = result['data'][0]
        workspace_object['info'] = object_info_to_dict(workspace_object['info'])

        return workspace_object

