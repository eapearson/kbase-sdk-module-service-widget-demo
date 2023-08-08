# Environment Variables

## Required

### `KBASE_ENDPOINT`

The `KBASE_ENDPOINT` is supplied automatically by the KBase dynamic service deployment service ("Service Wizard"). It corresponds to the base url for all core service calls within the deployment environment in which the service is running.

This base url may be used to form urls to services based on their "well known" paths. Note that service paths or urls may be overridden through other environment variables.

## Optional

### `TOKEN_CACHE_LIFETIME`

The `TOKEN_CACHE_LIFETIME` environment variable defines the quantity of time, in seconds, for which a KBase auth token, once validated against the auth service, is considered valid. 

Defaults to 300,00 milliseconds, or 5 minutes. May be disabled by setting it to 0.


### `TOKEN_CACHE_MAX_SIZE`

The `TOKEN_CACHE_MAX_SIZE` environment variable defines how many cache entries may reside in the KBase auth token cache at any given time. If the cache size is exceeded, the least recently used items are removed (at the time of writing the cache uses cachetools' TTLCache implementation.)

Defaults to 20,000, which is, as of the time of writing, far higher than anticipated for concurrent usage of KBase.

May not be disabled, and has a max range from 10 to 100,000.

### `SERVICE_REQUEST_TIMEOUT`

The `SERVICE_REQUEST_TIMEOUT` environment variable determines the maximum duration, in seconds, of an http request _from the service_ may take before it is cancelled. 

The default value is 60,000 milliseconds, or 1 minute.

This setting may not be disabled, and, if supplied, must have a value between 1 second (1000ms) and 1 hour (3,600,000ms). 

### `UI_ORIGIN`

The `UI_ORIGIN` environment variable determines the base url, or "origin" in browser DOM terminology, for creating urls intended for referring to KBase user interfaces.

Defaults to the origin component of KBASE_ENDPOINT, unless the host name is "kbase.us", in which case it becomes "narrative.kbase.us". This little heuristic is due to the split-host nature of KBase production, in which services run on `kbase.us` and user interfaces on `narrative.kbase.us`.

A typical use for supplying this is for local development, in which the service is running on a local host, yet one wants to exercise urls to a kbase runtime environment. 


### Services

Although KBase services contain configuration for each core service, in practice the url for each service never changes once established.

The pattern for service urls is `https://ENV.kbase.us/services/SERVICE_MODULE/METHOD_OR_PATH`, where

- `ENV` is the KBase deployment environment - `ci`, `next`, or `appdev`. In production the `ENV.` is omitted - i.e. the host is `kbase.us`.
- `SERVICE_MODULE` is typically a snake-case version of the service module identifier - but not always. For example, the `SERVICE_MODULE` path component for `ServiceWizard` is `service_wizard`, for `Groups` is `groups`, for `UserProfile` is `user_profile`; but for `Workspace` is `ws`.
- `METHOD_OR_PATH` identifies the endpoint within the service. For traditional JSON-RPC services, this string corresponds to a `METHOD`, for REST-like services it corresponds to a `PATH`, and may have sub-path components.

Note that the `https://ENV.kbase.us/services` is provided by default in the `KBASE_ENDPOINT` required environment variable. Therefore, the default path for each service is defined by the combination of the endpoint url and the well-known service paths.

Overriding of the service url may be useful in development. From what I understand, it is designed to allow a service to be relocated on an emergency basis, and to have all dependent services (those that call it) pointed to the new service location purely through configuration. In practice, this does not seem very practical as there are a dozen or so core services, about the same number of dynamic services, a handful of user interfaces, and hundreds of apps. Reconfiguring each of those is probably not feasible.

#### Core service paths

Note that any given dynamic service probably uses very few of these services.

| Service module name  | Type         | Path                | 
|----------------------|--------------|---------------------|
| Workspace            | JSON-RPC/1.1 | ws                  |
| auth2                | REST         | auth                |
| Catalog              | JSON-RPC/1.1 | catalog             |
| Feeds                | JSON-RPC/1.1 | feeds               |
| Groups               | JSON-RPC/1.1 | groups              |
| NarrativeMethodStore | JSON-RPC/1.1 | nms/rpc             |
| UserProfile          | JSON-RPC/1.1 | user_profile/rpc    |
| NarrativeJobService  | JSON-RPC/1.1 | njs_wrapper         |
| KBaseDataImport      | JSON-RPC/1.1 | data_import_export  |
| SampleService        | JSON-RPC/1.1 | sample_service      |
| RelationEngine       | REST         | relation_engine_api |
| SearchAPI2           | JSON-RPC/2.0 | searchapi2/rpc      |
| SearchAPI2           | JSON-RPC/2.0 | searchapi2/legacy   |
| execution_engine2    | JSON-RPC/1.1 | ee2                 |
| ORCIDLink            | REST         | orcidlink           |



