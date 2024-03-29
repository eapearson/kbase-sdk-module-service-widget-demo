FROM python:3.11.4-slim-bullseye
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
RUN curl -sSL https://install.python-poetry.org | python3 - --version 1.5.1

# Temporary fix for broken Python venv.
# setuptools is not used by poetry (see the install command below), but it is present
# anyway in poetry's venv (which is separate from that for the service). However, a bug
# in Python 3.11.1 (and perhaps others, I just confirmed with this version) installs the
# wrong version of setup tools -- it installs 65.5.0 from 3.11, which has a CVE issued
# against it. Just upgrading to the latest version, to avoid having to fix this when poetry's
# venv has a more recent version than 65.5.1 (which fixes the CVE). When the upstream issue is fixed,
# this line can be removed.
# RUN cd /root/.local/share/pypoetry && source venv/bin/activate && pip install --upgrade setuptools

# Don't need curl any more.
RUN apt-get purge -y curl && apt-get autoremove -y

# Annoyingly it puts it here.
ENV PATH="/root/.local/bin:$PATH"
ENV PYTHONPATH="/kb/module/service"

RUN mkdir -p /kb/module/work && mkdir /kb/module/config && mkdir /kb/module/scripts && mkdir -p /kb/module/service/deploy &&chmod -R a+rw /kb/module

# Copy build and startup tools
COPY ./scripts /kb/module/scripts
COPY ./etc /kb/module/etc
COPY ./poetry.lock /kb/module
COPY ./pyproject.toml /kb/module

# SDK Compatibility
COPY ./kbase.yml /kb/module
COPY ./sdk-compat /kb/module/sdk-compat

# We cherry-pick scripts
# TODO: just separate out deploy scripts from dev scripts.
# COPY ./sdk-compat/entrypoint.sh /kb/module/scripts
COPY ./scripts/deploy /kb/module/scripts/deploy

# Copy to service directory, which is where all runtime stuff needs to be.
# And, honestly, nothing else matters once it is running, so that is all
# there really needs to be
COPY ./SERVICE_DESCRIPTION.toml /kb/module/service
COPY ./src/servicewidgetdemo /kb/module/service/servicewidgetdemo
COPY ./static /kb/module/service/static

WORKDIR /kb/module

RUN poetry config virtualenvs.create false && poetry install

ENTRYPOINT [ "scripts/deploy/entrypoint.sh" ]
