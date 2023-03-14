from typing import Optional

from pydantic import BaseModel, Field
from servicewidgetdemo.lib.utils import epoch_time_millis


class Runtime(BaseModel):
    status: str = Field(...)
    initial_time: int = Field(...)
    start_time: Optional[int] = Field(default=None)


global_runtime = Runtime(status="initial", initial_time=epoch_time_millis())
