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

## Tools

### `Taskfile`

KBase SDK-based projects typically use `make` and a `Makefile`. I think this was originally due to tradition and the ubiquity of `make` in Unix-like systems. This project favors the `Taskfile`. 

"make" is based on the paradigm of specifying recipes for creating build artifacts, predominantly executable and object files, originally for C and C-like programming language toolchains.

However, when one steps away from C and into Python, Javascript, and the modern web stack in general, we don't generally produce single artifacts like this. We have a collection of tasks to accomplish building the app.

For one, we predominantly use interpreted languages. Modern usage of interpreted languages tends to apply code quality tools against them to ensure consistent formatting, lack of syntax errors, optional typing with static analysis to validate types, testing, and so forth. In the case of Javascript we typically have minification and bundling applied, and for Typescript transpilation.

Finally, we will have some set of processes to prepare an image and invoke a web server.

In other words, we have a bunch of tasks to apply during development, release, and deployment - a perfect scene in which to introduce the "Taskfile".

Now, generically we can discuss and perhaps agree that a "task oriented" tool is more appropriate to the application stack and workflow outlined above. There exist such tools for specific programming languages (Ruby's rake, Node's npm, Go's various tools). There also exist more general purpose task-runners (Javascript's gulp or grunt, "task", etc.)

In this case, I've charted a path towards simplicity - the `Taskfile`, a straightforward bash script

#### Origins

Not to be confused with https://taskfile.dev/, it's home is https://github.com/adriancooney/Taskfile. Forks are a bit more up-to-date.




#### How does it work

> describ it here