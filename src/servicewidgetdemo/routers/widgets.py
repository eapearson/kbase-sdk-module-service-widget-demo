from fastapi import APIRouter
from fastapi.staticfiles import StaticFiles
from servicewidgetdemo.lib.config import (
    Config,
    GitInfo,
    config,
    get_git_info,
    get_service_description,
)
from servicewidgetdemo.lib.type import ServiceBaseModel
from servicewidgetdemo.lib.utils import epoch_time_millis
from servicewidgetdemo.model import ServiceDescription

router = APIRouter(prefix="widgets")


router.mount("/status", StaticFiles(directory="status"), name="status")
router.mount("/info", StaticFiles(directory="info"), name="info")
