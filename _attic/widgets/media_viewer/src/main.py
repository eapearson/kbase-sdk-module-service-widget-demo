from js import console, document
import asyncio
import json
from typing import Tuple
from lib.workspace import WorkspaceService
from lib.html import Tag, Table
from pyscript import display


def view_object():
    pass


class ObjectInfoView:
    def __init__(self, workspace_info, object_info):
        html = ''
        html += '<table class="table table-striped"><tbody>'

        html += self.row('ID', object_info.get('object_id'))
        html += self.row('Object type', object_info.get('type'))
        html += self.row('Owner', workspace_info.get('owner'))
        html += self.row('Version', object_info.get('object_version'))
        html += self.row('Modified', object_info.get('saved_at'))
        html += self.row('Name', object_info.get('object_name'))

        html += '</tbody></table>'

        self.html = html

    def row(self, label: str, value: str) -> str:
        return f'<tr><th>{label}</th><td>{value}</td></tr>'

    def _repr_html_(self):
        return self.html

def render_sdk_boolean(value):
    if isinstance(value, str):
        value = int(value)

    return "true" if value == 1 else "false"

class MediaMetadataView:
    def __init__(self, metadata):
        html = ''
        html += '<table class="table table-striped"><tbody>'

        html += self.row('Name', metadata.get('Name'))
        html += self.row('Source ID', metadata.get('Source ID'))
        html += self.row('Is Minimal?', render_sdk_boolean(metadata.get('Is Minimal')))
        html += self.row('Is Defined?', render_sdk_boolean(metadata.get('Is Defined')))
        html += self.row('Number Compounds', metadata.get('Number compounds'))

        html += '</tbody></table>'

        self.html = html

    def row(self, label: str, value: str) -> str:
        return f'<tr><th>{label}</th><td>{value}</td></tr>'

    def _repr_html_(self):
        return self.html


def parse_workspace_ref(ref: str) -> Tuple[int, int, int]:
    wsid, objid, ver = ref.split('/')
    return int(wsid), int(objid), int(ver)

def render(content):
    display(content, target="root")
async def main():
    # TODO: get from ...
    workspace_url = "https://ci.kbase.us/services/ws"
    kbase_token = 'RSLDQ6TIQ2IU7MBG4VITA72PMETJGA54'
    object_ref = '69000/7/26'

    workspace = WorkspaceService(workspace_url, token=kbase_token)
    object_info = await workspace.get_object_info(object_ref)
    if object_info.size > 1_000_000:
        raise Exception(f'Object too big: {object_info.size}')

    workspace_id, _, _ = parse_workspace_ref(object_ref)

    workspace_info = await workspace.get_workspace_info(workspace_id)

    media_object = await workspace.get_object(object_ref)
    #
    # feature_set = feature_set_object.get('data').get('elements')
    # rows = []
    # for feature_id, ref_path in feature_set.items():
    #     ref = "; ".join(ref_path)
    #     feature_id_link = f'<a href="/#dataview/{ref}" target="_blank">{feature_id}</a>'
    #     rows.append([feature_id_link, ref])
    #
    # table = Table(['id', 'ref'], rows)

    render(Tag('h2', 'Media Object'))
    render(Tag('h3', 'Object Info'))
    render(ObjectInfoView(workspace_info, object_info))
    render(Tag('h3', 'Metadata'))
    render(MediaMetadataView(object_info.get('metadata')))
    print(object_info)
    print(workspace_info)
    print(media_object)

asyncio.ensure_future(main())