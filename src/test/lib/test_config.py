import os
from test.mocks.data import load_data_file

import pytest
from servicewidgetdemo.lib import config
from servicewidgetdemo.lib.utils import module_dir
from servicewidgetdemo.model import ServiceDescription

config_file = load_data_file("config1.toml")
config_file2 = load_data_file("config2.toml")
service_description_toml = load_data_file("service_description1.toml")


@pytest.fixture
def my_config_file(fs):
    fs.create_file("/kb/module/deploy/config.toml", contents=config_file)
    fs.create_file(
        "/kb/module/SERVICE_DESCRIPTION.toml", contents=service_description_toml
    )
    fs.add_real_directory("/kb/module/test/data")
    yield fs


@pytest.fixture
def my_config_file2(fs):
    fs.create_file("/kb/module/deploy/config.toml", contents=config_file2)
    fs.add_real_directory("/kb/module/test/data")
    yield fs


def test_get_config(my_config_file2):
    c = config.ConfigManager(os.path.join(module_dir(), "deploy/config.toml"))
    assert (
        c.config().services.Auth2.url
        == "https://ci.kbase.us/services/auth/api/V2/token"
    )


def test_get_service_description():
    value = config.get_service_description()
    assert type(value) == ServiceDescription
    assert value.name == "ServiceWidgetDemo"
    assert value.language == "Python"
