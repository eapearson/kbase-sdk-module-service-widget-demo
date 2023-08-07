# Simple Dynamic Service

At KBase, a kb-sdk-driven app may take the form of a "dynamic service". Such a dynamic service is an http JSON-RPC 1.1 service. It requires usage `kb-sdk` to manage, with the core server supplied and the method implementation (so-called "impl" file) managed by kb-sdk, but with method app logic filled in by the user. This is driven by the API specification file, the "spec" file.

This architecture has many benefits, and has taken KBase app development very far.

However, for dynamic services ...

## Current Requirements for a Dynamic Service

Because the KBase App SDK is opaque, most are unaware that it is not required in order to create a dynamic service. Other than a few conventions, and required artifact files, a dynamic service is at its core a web server running in a Docker container.


### `kbase.yml` - Service Metadata

A `kbase.yml` configuration and metadata file is required in order for a service to be registered in a KBase environment.

This file contains both functional and descriptive information 

The 

Example `kbase.yml`:

```yaml
module-name:
  ServiceWidgetDemo

module-description:
  A dynamic service to demonstrate serving widgets, and providing an API for such widgets.

service-language:
  python

module-version:
  0.2.0

owners:
  [ eapearson ]

service-config:
  dynamic-service: true

```
### Required Artifact Files

The `sdk-compat` directory contains all artifact files necessary for deployment to a KBase environment.



### Makefile

### Environment Variables

### Entrypoint

### Dockerfile

## New Architecture

## Design Principles

- minimize requirement to install service or development tools on host machine; use docker instead

- run everything through the Taskfile

- Use code quality tools - mypy, black

- validate all data files with jsonschema

- Seek 100% test coverage

- No runtime cross-site http requests

- keep it synchronous, don't use async/await
  - we are trying to keep this approachable