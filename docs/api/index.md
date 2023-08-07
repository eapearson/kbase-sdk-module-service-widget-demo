<a name="header_widget-demo-dynamic-service"></a>
# Widget Demo Dynamic Service
<table><tr><td>version: 0.1.0</td></tr></table>


The ServiceWidgetDemo is a KBase SDK-compatible dynamic service for demonstrating
the ability to provide widgets in a dynamic service.

<a name="header_terms-of-service"></a>
## Terms of Service
<a href="https://www.kbase.us/about/terms-and-conditions-v2/">https://www.kbase.us/about/terms-and-conditions-v2/</a>
<a name="header_contact"></a>
## Contact
KBase, Lawrence Berkeley National Laboratory, DOE  
<a href="https://www.kbase.us/">https://www.kbase.us/</a>  
engage@kbase.us
<a name="header_license"></a>
## License
The MIT License
<a href="https://github.com/kbase/kb_sdk/blob/develop/LICENSE.md">https://github.com/kbase/kb_sdk/blob/develop/LICENSE.md</a>
## Usage

This document is primarily generated from the `openapi` interface generated 
by <a href="https://fastapi.tiangolo.com">FastAPI</a>.

The [Endpoints](#user-content-header_endpoints) section documents all REST endpoints, including the 
expected responses, input parameters and output JSON and type definitions.

The [Types](#user-content-header_types) section defines all of the Pydantic models used in the codebase, 
most of which are in service of the input and output types mentioned above.

### Issues

- Due to limitations of GitHub's markdown support, tables have two empty rows at the start of the header. This is due to the fact that GitHub does not allow any table formatting instructions, so we need to use the first two rows to establish the table and column widths. 

## Table of Contents    

- [Endpoints](#user-content-header_endpoints)
    - [misc](#user-content-header_misc)
- [Types](#user-content-header_types)
- [Glossary](#user-content-header_glossary)


<a name="header_endpoints"></a>
## Endpoints
<a name="header_misc"></a>
### misc
Miscellaneous operations
<a name="header_get-/status"></a>
#### GET /status
Get Service Status

With no parameters, this endpoint returns the current status of the service. The status code itself
is always "ok". Other information includes the current time, and the start time.

It can be used as a healthcheck, for basic latency performance (as it makes no
i/o or other high-latency calls), or for time synchronization (as it returns the current time).


<a name="header_input"></a>
#### Input
*none*


<a name="header_output"></a>
#### Output
<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="150px"></th><th><img width="1000px"></th><th><img width="150px"></th><tr><th>Status Code</th><th>Description</th><th>Type</th></tr></thead><tbody><tr><td>200</td><td>Successfully returns the service status</td><td><a href="#user-content-header_type_statusresponseinput">StatusResponseInput</a></td></tr></tbody></table>


---
<a name="header_get-/info"></a>
#### GET /info
Get Service Information

Returns basic information about the service and its runtime configuration.


<a name="header_input"></a>
#### Input
*none*


<a name="header_output"></a>
#### Output
<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="150px"></th><th><img width="1000px"></th><th><img width="150px"></th><tr><th>Status Code</th><th>Description</th><th>Type</th></tr></thead><tbody><tr><td>200</td><td>Successful Response</td><td><a href="#user-content-header_type_inforesponse">InfoResponse</a></td></tr></tbody></table>


---
<a name="header_get-/rcsb-annotations/{ref}"></a>
#### GET /rcsb-annotations/{ref}
Get RCSB Annotations from a Genome


<a name="header_input"></a>
#### Input
<table><thead><tr><th colspan="4"><img width="2000px"></th></tr><tr><th><img width="150px"></th><th><img width="1000px"></th><th><img width="150px"></th><th><img width="150px"></th><tr><th>Name</th><th>Description</th><th>Type</th><th>In</th></tr></thead><tbody><tr><td>ref</td><td>n/a</td><td>string</td><td>path</td></tr><tr><td>authorization</td><td>KBase auth token</td><td>n/a</td><td>header</td></tr></tbody></table>


<a name="header_output"></a>
#### Output
<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="150px"></th><th><img width="1000px"></th><th><img width="150px"></th><tr><th>Status Code</th><th>Description</th><th>Type</th></tr></thead><tbody><tr><td>200</td><td>Successful Response</td><td>!! NOT HANDLED !!</td></tr><tr><td>422</td><td>Validation Error</td><td><a href="#user-content-header_type_httpvalidationerror">HTTPValidationError</a></td></tr></tbody></table>


---
<a name="header_get-/docs"></a>
#### GET /docs
Get API Documentation

Provides a web interface to the auto-generated API docs.


<a name="header_input"></a>
#### Input
*none*


<a name="header_output"></a>
#### Output
<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="150px"></th><th><img width="1000px"></th><th><img width="150px"></th><tr><th>Status Code</th><th>Description</th><th>Type</th></tr></thead><tbody><tr><td>200</td><td>Successfully returned the api docs</td><td>text/html</td></tr><tr><td>404</td><td>Not Found</td><td><i>none</i></td></tr></tbody></table>


---
<a name="header_get-/widgets/media-viewer"></a>
#### GET /widgets/media-viewer
Get API Documentation

Provides a web interface to the auto-generated API docs.


<a name="header_input"></a>
#### Input
<table><thead><tr><th colspan="4"><img width="2000px"></th></tr><tr><th><img width="150px"></th><th><img width="1000px"></th><th><img width="150px"></th><th><img width="150px"></th><tr><th>Name</th><th>Description</th><th>Type</th><th>In</th></tr></thead><tbody><tr><td>ref</td><td>A KBase object ref (path)</td><td>string</td><td>query</td></tr><tr><td>kbase_session</td><td>KBase auth token</td><td>n/a</td><td>cookie</td></tr></tbody></table>


<a name="header_output"></a>
#### Output
<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="150px"></th><th><img width="1000px"></th><th><img width="150px"></th><tr><th>Status Code</th><th>Description</th><th>Type</th></tr></thead><tbody><tr><td>200</td><td>Jinja Demo Successfully rendered</td><td>text/html</td></tr><tr><td>404</td><td>Not Found</td><td><i>none</i></td></tr><tr><td>422</td><td>Validation Error</td><td><a href="#user-content-header_type_httpvalidationerror">HTTPValidationError</a></td></tr></tbody></table>


---
<a name="header_get-/widgets/protein-structures-viewer"></a>
#### GET /widgets/protein-structures-viewer
Get API Documentation

Provides a web interface to the auto-generated API docs.


<a name="header_input"></a>
#### Input
<table><thead><tr><th colspan="4"><img width="2000px"></th></tr><tr><th><img width="150px"></th><th><img width="1000px"></th><th><img width="150px"></th><th><img width="150px"></th><tr><th>Name</th><th>Description</th><th>Type</th><th>In</th></tr></thead><tbody><tr><td>ref</td><td>A KBase object ref (path)</td><td>string</td><td>query</td></tr><tr><td>kbase_session</td><td>KBase auth token</td><td>n/a</td><td>cookie</td></tr></tbody></table>


<a name="header_output"></a>
#### Output
<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="150px"></th><th><img width="1000px"></th><th><img width="150px"></th><tr><th>Status Code</th><th>Description</th><th>Type</th></tr></thead><tbody><tr><td>200</td><td>Jinja Demo Successfully rendered</td><td>text/html</td></tr><tr><td>404</td><td>Not Found</td><td><i>none</i></td></tr><tr><td>422</td><td>Validation Error</td><td><a href="#user-content-header_type_httpvalidationerror">HTTPValidationError</a></td></tr></tbody></table>


---


<a name="header_types"></a>
## Types
This section presents all types defined via FastAPI (Pydantic). They are ordered
alphabetically, which is fine for looking them up, but not for their relationships.

> TODO: a better presentation of related types

<a name="header_type_auth2service"></a>
##### Auth2Service

<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="1000px"></th><th><img width="200px"></th><th><img width="75px"></th><tr><th>Name</th><th>Type</th><th>Required</th></tr></thead><tbody><tr><td>url</td><td>string</td><td>✓</td></tr><tr><td>tokenCacheLifetime</td><td>integer</td><td>✓</td></tr><tr><td>tokenCacheMaxSize</td><td>integer</td><td>✓</td></tr></tbody></table>



<a name="header_type_config"></a>
##### Config

<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="1000px"></th><th><img width="200px"></th><th><img width="75px"></th><tr><th>Name</th><th>Type</th><th>Required</th></tr></thead><tbody><tr><td>services</td><td><a href="#user-content-header_type_services">Services</a></td><td>✓</td></tr><tr><td>ui</td><td><a href="#user-content-header_type_uiconfig">UIConfig</a></td><td>✓</td></tr><tr><td>module</td><td><a href="#user-content-header_type_moduleconfig">ModuleConfig</a></td><td>✓</td></tr></tbody></table>



<a name="header_type_gitinfo"></a>
##### GitInfo

<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="1000px"></th><th><img width="200px"></th><th><img width="75px"></th><tr><th>Name</th><th>Type</th><th>Required</th></tr></thead><tbody><tr><td>commit_hash</td><td>string</td><td>✓</td></tr><tr><td>commit_hash_abbreviated</td><td>string</td><td>✓</td></tr><tr><td>author_name</td><td>string</td><td>✓</td></tr><tr><td>author_date</td><td>integer</td><td>✓</td></tr><tr><td>committer_name</td><td>string</td><td>✓</td></tr><tr><td>committer_date</td><td>integer</td><td>✓</td></tr><tr><td>url</td><td>string</td><td>✓</td></tr><tr><td>branch</td><td>string</td><td>✓</td></tr><tr><td>tag</td><td><div><i>Any Of</i></div><div>string</div><div>null</div></td><td>✓</td></tr></tbody></table>



<a name="header_type_httpvalidationerror"></a>
##### HTTPValidationError

<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="1000px"></th><th><img width="200px"></th><th><img width="75px"></th><tr><th>Name</th><th>Type</th><th>Required</th></tr></thead><tbody><tr><td>detail</td><td>array</td><td></td></tr></tbody></table>



<a name="header_type_inforesponse"></a>
##### InfoResponse

<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="1000px"></th><th><img width="200px"></th><th><img width="75px"></th><tr><th>Name</th><th>Type</th><th>Required</th></tr></thead><tbody><tr><td>service-description</td><td><a href="#user-content-header_type_servicedescription">ServiceDescription</a></td><td>✓</td></tr><tr><td>config</td><td><a href="#user-content-header_type_config">Config</a></td><td>✓</td></tr><tr><td>git-info</td><td><a href="#user-content-header_type_gitinfo">GitInfo</a></td><td>✓</td></tr></tbody></table>



<a name="header_type_kbaseservice"></a>
##### KBaseService

<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="1000px"></th><th><img width="200px"></th><th><img width="75px"></th><tr><th>Name</th><th>Type</th><th>Required</th></tr></thead><tbody><tr><td>url</td><td>string</td><td>✓</td></tr></tbody></table>



<a name="header_type_moduleconfig"></a>
##### ModuleConfig

<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="1000px"></th><th><img width="200px"></th><th><img width="75px"></th><tr><th>Name</th><th>Type</th><th>Required</th></tr></thead><tbody><tr><td>serviceRequestTimeout</td><td>integer</td><td>✓</td></tr></tbody></table>



<a name="header_type_servicedescription"></a>
##### ServiceDescription

<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="1000px"></th><th><img width="200px"></th><th><img width="75px"></th><tr><th>Name</th><th>Type</th><th>Required</th></tr></thead><tbody><tr><td>name</td><td>string</td><td>✓</td></tr><tr><td>title</td><td>string</td><td>✓</td></tr><tr><td>language</td><td>string</td><td>✓</td></tr><tr><td>description</td><td>string</td><td>✓</td></tr></tbody></table>



<a name="header_type_servicewidgetdemo"></a>
##### ServiceWidgetDemo

<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="1000px"></th><th><img width="200px"></th><th><img width="75px"></th><tr><th>Name</th><th>Type</th><th>Required</th></tr></thead><tbody><tr><td>url</td><td>string</td><td>✓</td></tr></tbody></table>



<a name="header_type_services"></a>
##### Services

<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="1000px"></th><th><img width="200px"></th><th><img width="75px"></th><tr><th>Name</th><th>Type</th><th>Required</th></tr></thead><tbody><tr><td>Auth2</td><td><a href="#user-content-header_type_auth2service">Auth2Service</a></td><td>✓</td></tr><tr><td>ServiceWidgetDemo</td><td><a href="#user-content-header_type_servicewidgetdemo">ServiceWidgetDemo</a></td><td>✓</td></tr><tr><td>Workspace</td><td><a href="#user-content-header_type_kbaseservice">KBaseService</a></td><td>✓</td></tr></tbody></table>



<a name="header_type_statusresponseinput"></a>
##### StatusResponseInput

<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="1000px"></th><th><img width="200px"></th><th><img width="75px"></th><tr><th>Name</th><th>Type</th><th>Required</th></tr></thead><tbody><tr><td>status</td><td>string</td><td>✓</td></tr><tr><td>time</td><td>integer</td><td>✓</td></tr><tr><td>initial_time</td><td>integer</td><td>✓</td></tr><tr><td>start_time</td><td><div><i>Any Of</i></div><div>integer</div><div>null</div></td><td></td></tr></tbody></table>



<a name="header_type_statusresponseoutput"></a>
##### StatusResponseOutput

<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="1000px"></th><th><img width="200px"></th><th><img width="75px"></th><tr><th>Name</th><th>Type</th><th>Required</th></tr></thead><tbody><tr><td>status</td><td>string</td><td>✓</td></tr><tr><td>time</td><td>integer</td><td>✓</td></tr><tr><td>initial_time</td><td>integer</td><td>✓</td></tr><tr><td>start_time</td><td><div><i>Any Of</i></div><div>integer</div><div>null</div></td><td>✓</td></tr></tbody></table>



<a name="header_type_uiconfig"></a>
##### UIConfig

<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="1000px"></th><th><img width="200px"></th><th><img width="75px"></th><tr><th>Name</th><th>Type</th><th>Required</th></tr></thead><tbody><tr><td>origin</td><td>string</td><td>✓</td></tr></tbody></table>



<a name="header_type_validationerror"></a>
##### ValidationError

<table><thead><tr><th colspan="3"><img width="2000px"></th></tr><tr><th><img width="1000px"></th><th><img width="200px"></th><th><img width="75px"></th><tr><th>Name</th><th>Type</th><th>Required</th></tr></thead><tbody><tr><td>loc</td><td>array</td><td>✓</td></tr><tr><td>msg</td><td>string</td><td>✓</td></tr><tr><td>type</td><td>string</td><td>✓</td></tr></tbody></table>



<a name="header_glossary"></a>
## Glossary
<dl>
</dl>
-fin-