FROM python:3.11.1-slim-bullseye
# Note that the python version needs to match that used to create
# poetry.lock.

MAINTAINER KBase Developer
LABEL org.opencontainers.image.source = "https://github.com/kbase/kbase-sdk-module-widget-demo"
LABEL org.opencontainers.image.description="A KBase dynamic service for testing widgets"
LABEL org.opencontainers.image.licenses=MIT

# -----------------------------------------
# In this section, you can install any system dependencies required
# to run your App.  For instance, you could place an apt-get update or
# install line here, a git checkout to download code, or run any other
# installation scripts.
# -----------------------------------------

# We need curl to install poetry; git for the git-info tool.
RUN apt-get update && apt-get install -y curl git

SHELL ["/bin/bash", "-c"]

# Install poetry
RUN curl -sSL https://install.python-poetry.org | python3 - --version 1.4.0

# Temporary fix for broken Python venv.
# setuptools is not used by poetry (see the install command below), but it is present
# anyway in poetry's venv (which is separate from that for the service). However, a bug
# in Python 3.11.1 (and perhaps others, I just confirmed with this version) installs the
# wrong version of setup tools -- it installs 65.5.0 from 3.11, which has a CVE issued
# against it. Just upgrading to the latest version, to avoid having to fix this when poetry's
# venv has a more recent version than 65.5.1 (which fixes the CVE). When the upstream issue is fixed,
# this line can be removed.
RUN cd /root/.local/share/pypoetry && source venv/bin/activate && pip install --upgrade setuptools

# Don't need curl any more.
RUN apt-get purge -y curl && apt-get autoremove -y

# Annoyingly it puts it here.
ENV PATH="/root/.local/bin:$PATH"
ENV PYTHONPATH="/kb/module/service"

RUN mkdir -p /kb/module/work && mkdir /kb/module/config && mkdir /kb/module/scripts && chmod -R a+rw /kb/module

# Copying only files needed for service runtime.
# Other usages of this image, e.g. testing, mount the project root at /kb/module
# and have access to everything.
COPY ./scripts /kb/module/scripts
# TODO: copy to service directory instead of src
COPY ./src/servicewidgetdemo /kb/module/service/servicewidgetdemo
COPY ./etc /kb/module/etc
COPY ./poetry.lock /kb/module
COPY ./pyproject.toml /kb/module
COPY ./SERVICE_DESCRIPTION.toml /kb/module
# SDK Compatibility
COPY ./kbase.yml /kb/module
COPY ./sdk-compat /kb/module/sdk-compat
# We cherry-pick scripts
# TODO: just separate out deploy scripts from dev scripts.
# COPY ./sdk-compat/entrypoint.sh /kb/module/scripts
COPY ./scripts/deploy /kb/module/scripts/deploy
# COPY ./scripts/start-server.sh /kb/module/scripts
# COPY ./scripts/render-config.sh /kb/module/scripts
# Widgets
COPY ./build/widgets  /kb/module/widgets

WORKDIR /kb/module

RUN poetry config virtualenvs.create false && poetry config virtualenvs.options.no-setuptools true && poetry install

ENTRYPOINT [ "scripts/deploy/entrypoint.sh" ]
