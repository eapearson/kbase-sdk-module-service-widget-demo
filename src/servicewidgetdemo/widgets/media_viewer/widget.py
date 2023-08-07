import json

from jinja2 import ChoiceLoader, Environment, PackageLoader

from servicewidgetdemo.lib.config import Config
from servicewidgetdemo.lib.service_clients.workspace import (
    WorkspaceService,
    parse_workspace_ref,
)


class Widget:
    def __init__(self, token: str, ref: str, config: Config):
        # KBase auth token, as provided by the router
        self.token = token

        # Ref parameter, as provided by the router.
        self.ref = ref

        # Config, as provided by the router, but that just gets it from  the
        # global service config.
        self.config = config

        # Set up for loading templates out of the templates directory.
        global_loader = PackageLoader("servicewidgetdemo.widgets", "templates")
        widget_loader = PackageLoader(
            "servicewidgetdemo.widgets.media_viewer", "templates"
        )
        loader = ChoiceLoader([widget_loader, global_loader])
        self.env = Environment(loader=loader)

    def render(self) -> str:
        # get workspace and object infos.
        workspace = WorkspaceService(
            self.config.services.Workspace.url, token=self.token
        )
        try:
            object_info = workspace.get_object_info(self.ref)
        except Exception as ex:
            template = self.env.get_template("error.html")
            error = {
                "title": "Error",
                "code": "error-fetching-object",
                "message": str(ex),
            }
            return template.render(error=error)

        if object_info.size > 1_000_000:
            raise Exception(f"Object too big: {object_info.size}")

        workspace_id, _, _ = parse_workspace_ref(self.ref)

        workspace_info = workspace.get_workspace_info(workspace_id)

        media_object = workspace.get_object(self.ref)

        template = self.env.get_template("index.html")
        return template.render(
            token=self.token, workspace_info=workspace_info, media_object=media_object
        )
