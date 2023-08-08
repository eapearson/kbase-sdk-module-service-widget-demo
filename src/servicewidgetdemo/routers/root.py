import json
import time
from pathlib import Path
from typing import Any, List, Tuple

from fastapi import APIRouter, Header
from pydantic import Field
from servicewidgetdemo.lib.config import (
    Config2,
)
from servicewidgetdemo.lib.runtime import global_runtime
from servicewidgetdemo.lib.service_clients.workspace import WorkspaceService
from servicewidgetdemo.lib.type import ServiceBaseModel
from servicewidgetdemo.lib.utils import epoch_time_millis

router = APIRouter(prefix="")


class StatusResponse(ServiceBaseModel):
    status: str = Field(...)
    time: int = Field(...)
    initial_time: int = Field(...)
    start_time: int | None = Field(default=None)


@router.get(
    "/status",
    response_model=StatusResponse,
    tags=["misc"],
    responses={
        200: {
            "description": "Successfully returns the service status",
            "model": StatusResponse,
        }
    },
)
async def get_status() -> StatusResponse:
    """
    Get Service Status

    With no parameters, this endpoint returns the current status of the service. The status code itself
    is always "ok". Other information includes the current time, and the start time.

    It can be used as a healthcheck, for basic latency performance (as it makes no
    i/o or other high-latency calls), or for time synchronization (as it returns the current time).
    """
    # TODO: start time, deal Kwith it@
    start_time = global_runtime.start_time
    status = global_runtime.status
    return StatusResponse(
        status=status,
        initial_time=global_runtime.initial_time,
        start_time=start_time,
        time=epoch_time_millis(),
    )


# REMOVE info response for now, just use /status.
# class InfoResponse(ServiceBaseModel):
#     config: Config = Field(...)
#
#
# @router.get("/info", response_model=InfoResponse, tags=["misc"])
# async def get_info() -> InfoResponse:
#     """
#     Get Service Information
#
#     Returns basic information about the service and its runtime configuration.
#     """
#     # TODO: version should either be separate call, or derived from the a file stamped during the build.
#     config_copy = config().model_copy(deep=True)
#     # NB we can mix dict and model here.
#     return InfoResponse.model_validate(
#         {
#             "config": config_copy
#         }
#     )


AUTHORIZATION_HEADER = Header(
    default=None,
    description="KBase auth token",
    min_length=32,
    max_length=32,
)

# Apparently we can't type a table in mypy.

# PDBInfoHeader = Tuple[str, str]
# ['itemId', 'name', 'format', 'genomeRef', 'genomeName', 'fromRCSB', 'featureId', 'featureType', 'sequenceIdentities'];
# [string, string, string, string, string, boolean, string, string, string]
PDBInfo = Tuple[str, str, str, str, str, bool, str, str, str]


# class PDBInfos(ServiceBaseModel):
#     infos: List[PDBInfoRow]


class GetRCSBAnnotationsResult(ServiceBaseModel):
    pdb_features: List[PDBInfo]


@router.get("/rcsb-annotations/{ref}", response_model=Any, tags=["misc"])
async def get_rcsb_annotations(
    ref: str, authorization: str | None = AUTHORIZATION_HEADER
) -> GetRCSBAnnotationsResult:
    """
    Get RCSB Annotations from a Genome
    """
    # Get genome, perhaps from cache.
    # TODO

    raw_wsid, raw_objid, raw_ver = ref.split("_")
    wsid = int(raw_wsid)
    objid = int(raw_objid)
    ver = int(raw_ver)
    genomeRef = f"{wsid}/{objid}/{ver}"

    # First ensure this user can access the object.
    # TODO: get from config.
    config = Config2()
    workspace = WorkspaceService(
        url=config.get_workspace_url(),
        timeout=config.get_request_timeout(),
        authorization=authorization,
    )

    start = time.perf_counter()

    if not workspace.can_access_object(genomeRef):
        raise Exception(f"Cannot access object with ref '{genomeRef}'")

    got_access = time.perf_counter()

    filename = f"object_{wsid}_{objid}_{ver}.json"
    filepath = Path(f"/kb/module/work/{filename}")

    if filepath.is_file():
        got_is_file = time.perf_counter()
        print("getting from cache", got_access - start, got_is_file - got_access)
        # TODO: not much faster than a WS call (900ms vs 700ms from local dev machine);
        #       should switch to a memory-based cache? But genome objects can be
        #       very large.
        with open(filepath) as fin:
            genome_object = json.load(fin)
    else:
        genome_object = workspace.get_object(genomeRef)
        with open(filepath, "w") as fout:
            json.dump(genome_object, fout)

    [
        object_id,
        object_name,
        type,
        save_date,
        version,
        saved_by,
        workspace_id,
        ws_name,
        checksum,
        size,
        metadata,
    ] = genome_object["info"]

    # pdb_infos = [['row_id', 'structure_name', 'format', 'genome_ref', 'genome_name', 'from_rcsb', 'feature_id', 'feature_type', 'sequence_identities']]
    pdb_infos = []

    if "features" in genome_object["data"]:
        for feature in genome_object["data"]["features"]:
            if "ontology_terms" in feature:
                feature_id = feature["id"]
                ontology = feature["ontology_terms"]
                if "RCSB" in ontology:
                    terms = ontology["RCSB"].keys()
                    for term in terms:
                        bare_term = term.split(":")[1].split("_")[0]
                        # This should be unique for each row
                        item_id = f"{feature_id}_{bare_term}"
                        pdb_infos.append(
                            (
                                item_id,
                                bare_term,
                                "pdb",
                                genomeRef,
                                object_name,
                                True,
                                feature_id,
                                feature["type"],
                                "N/A",
                            )
                        )

    return GetRCSBAnnotationsResult(pdb_features=pdb_infos)
