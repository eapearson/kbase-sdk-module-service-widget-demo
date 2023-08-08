import json

from jinja2 import ChoiceLoader, Environment, PackageLoader
from servicewidgetdemo.lib.config import Config2
from servicewidgetdemo.lib.service_clients.workspace import (
    WorkspaceService,
    parse_workspace_ref,
)

VIEWER_NAME = "protein_structures_viewer"


class Widget:
    def __init__(self, token: str, ref: str):
        self.token = token
        self.ref = ref
        self.config = Config2()
        # Set up for loading templates out of the templates directory.
        global_loader = PackageLoader("servicewidgetdemo.widgets", "templates")
        widget_loader = PackageLoader(
            f"servicewidgetdemo.widgets.{VIEWER_NAME}", "templates"
        )
        loader = ChoiceLoader([widget_loader, global_loader])
        self.env = Environment(loader=loader)

    def render(self) -> str:
        # get workspace and object infos.

        workspace = WorkspaceService(
            url=self.config.get_workspace_url(),
            timeout=self.config.get_request_timeout(),
            authorization=self.token,
        )
        object_info = workspace.get_object_info(self.ref)
        if object_info.size > 1_000_000:
            raise Exception(f"Object too big: {object_info.size}")

        workspace_id, _, _ = parse_workspace_ref(self.ref)

        workspace_info = workspace.get_workspace_info(workspace_id)

        protein_structures_object = workspace.get_object(self.ref)

        pdb_infos_json = json.dumps(protein_structures_object["data"]["pdb_infos"])

        template = self.env.get_template("index-latest.html")
        return template.render(
            token=self.token,
            workspace_info=workspace_info,
            protein_structures_object=protein_structures_object,
            pdb_infos_json=pdb_infos_json,
        )
