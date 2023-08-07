from js import console, document
import asyncio
import json
from typing import Any
from lib.workspace import WorkspaceService
from lib.html import Tag, Table
from pyscript import display


def view_object():
    pass



def render(content):
    display(content, target="root")
async def main():
    # TODO: get from ...
    workspace_url = "https://ci.kbase.us/services/ws"
    kbase_token = 'RSLDQ6TIQ2IU7MBG4VITA72PMETJGA54'
    object_ref = '69000/6/1'

    workspace = WorkspaceService(workspace_url, token=kbase_token)
    object_info = await workspace.get_object_info(object_ref)
    if object_info.get('size') > 1_000_000:
        raise Exception(f'Object too big: {object_info.get("size")}')

    feature_set_object = await workspace.get_object(object_ref)

    feature_set = feature_set_object.get('data').get('elements')
    rows = []
    for feature_id, ref_path in feature_set.items():
        ref = "; ".join(ref_path)
        feature_id_link = f'<a href="/#dataview/{ref}" target="_blank">{feature_id}</a>'
        rows.append([feature_id_link, ref])

    table = Table(['id', 'ref'], rows)

    render(Tag('h2', 'Feature Set'))
    render(table)


asyncio.ensure_future(main())