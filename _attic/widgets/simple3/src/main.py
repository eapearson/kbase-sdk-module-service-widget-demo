from js import first, console, document
import asyncio
import json
from typing import Any
from lib.workspace import WorkspaceService
from pyscript import display


def view_object():
    pass

class Tag:
    def __init__(self, tag_name: str, content: str):
        html = f'<{tag_name}>{content}</{tag_name}>'
        self.html = html

    def _repr_html_(self):
        return self.html

class Table:
    def __init__(self, header, rows):
        html = '<table class="table"><thead><tr>'
        for field in header:
            html += f'<th>{field}</th>'
        html += '</tr></thead><tbody>'
        for row in rows:
            html += '<tr>'
            for field in row:
                html += f'<td>{field}</td>'
            html += '</tr>'
        html += '</tbody></table>'
        self.html = html
    def _repr_html_(self):
        return self.html

def render(content):
    display(content, target="root")
async def main():
    el = document.getElementById('root')
    el.innerText = "FOO"
    workspace_url = "https://ci.kbase.us/services/ws"
    kbase_token = 'RSLDQ6TIQ2IU7MBG4VITA72PMETJGA54'
    workspace = WorkspaceService(workspace_url, token=kbase_token)
    object_ref = '69006/1/1'
    object_ref = '69000/6/1'
    object_info = await workspace.get_object_info(object_ref)
    if object_info.get('size') > 1_000_000:
        raise Exception(f'Object too big: {object_info.get("size")}')

    print('got object info')
    feature_set_object = await workspace.get_object(object_ref)

    feature_set = feature_set_object.get('data').get('elements')
    rows = []
    for feature_id, ref_path in feature_set.items():
        ref = "; ".join(ref_path)
        feature_id_link = f'<a href="/#dataview/{ref}" target="_blank">{feature_id}</a>'
        rows.append([feature_id_link, ref])
    print('hmm', rows)
    table = Table(['id', 'ref'], rows)
    print('the object!', feature_set_object)
    # print('the table!', table)
    render(Tag('h2', 'Feature Set'))
    render(table)


asyncio.ensure_future(main())