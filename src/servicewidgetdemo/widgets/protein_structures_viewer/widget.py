import json

from jinja2 import ChoiceLoader, Environment, PackageLoader

from src.servicewidgetdemo.lib.config import Config
from src.servicewidgetdemo.lib.service_clients.workspace import WorkspaceService, parse_workspace_ref

VIEWER_NAME = 'protein_structures_viewer'

class Widget:
    def __init__(self, token: str, ref: str, config: Config):
        self.token = token
        self.ref = ref
        self.config = config
        # Set up for loading templates out of the templates directory.
        global_loader = PackageLoader('servicewidgetdemo.widgets', 'templates')
        widget_loader = PackageLoader(f'servicewidgetdemo.widgets.{VIEWER_NAME}', 'templates')
        loader = ChoiceLoader([widget_loader, global_loader])
        self.env = Environment(loader=loader)

    def render(self):
        # get workspace and object infos.

        workspace = WorkspaceService(self.config.services.Workspace.url, token=self.token)
        object_info = workspace.get_object_info(self.ref)
        if object_info.get('size') > 1_000_000:
            raise Exception(f'Object too big: {object_info.get("size")}')

        workspace_id, _, _ = parse_workspace_ref(self.ref)

        workspace_info = workspace.get_workspace_info(workspace_id)

        protein_structures_object = workspace.get_object(self.ref)

        # print('OBJECT', json.dumps(workspace_info, indent=4), json.dumps(protein_structures_object, indent=4))

        pdb_infos_json = json.dumps(protein_structures_object['data']['pdb_infos'])

        template = self.env.get_template('index-latest.html')
        return template.render(
            token=self.token,
            workspace_info=workspace_info,
            protein_structures_object=protein_structures_object,
            pdb_infos_json=pdb_infos_json)