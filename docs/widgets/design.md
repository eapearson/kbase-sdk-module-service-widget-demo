# Widget Design Ideas

We are trying out some different ideas in this demo service.

## What is a widget?

The term "widget" is from the Narrative point of view, as it appears as a widget in a service widget cell.

From the service point of view, though, a service widget is a web app - an index.html file, some css, some javascript.

There are so many ways to build a web app ... so let's dive in. 

Let's describe them chronologically:

## Simple Web App

First there as the "hello world" of widgets. This is literally one html file, one stylesheet, and one javascript file.

Without Narrative integration, each of these components can be very minimal.

However, as soon as such integration is required, there a bit of javascript machinery needs to be added. This machinery is responsible for sending and receiving messages with the Narrative via the web browser "postMessage" technology.

### Pros

Simple, fast to develop
Low hangning fruit for non-JS developers

### Cons

Difficult to test
Difficult to manage as code grows
## Standard Modern Web App

A step up from the simple web app is a modern bundled web app built with Typescript, React, and a development environment like Vite.

Such a web app compiles down to the same files as for a Simple Web App, but there may be many more files involved.

This app architecture is "modern" for a reason - it allows static program analysis, strict typing, safe and formal usage of a broad range of support libraries. All visualization and analysis libraries worth their salt in the Javascript/Typescript world are at your fingertips.

### Pros

Compact, fast code
Typesafe
Integrated testing tools
Vast number of front end libraries

### Cons

Professional level JS skills required
(But tools can help ameliorate this)

## With a Python Twist

A modern web app can also be built with pyscript, a python-in-browser Python interpreter. Pyscript runs in the browser (as web assembly) and runs Python 3 code. It offers strong Javascript integration, including usage of a great many available libraries.

### Pros

Familiar language for Python developers
Tight JS integration means many browser-centric libraries available

### Cons

Slow
Some libraries or techniques will be different compared to host-based Python.


## Fully Python based with templates and a sprinkling of JS

This may sound strange for a web app, but may be suitable for KBase. 

The service code can generate HTML, from Python templates (e.g. jinja2) and use a sprinkling of Javascript to provide interactivity and to integration third party visualization libraries.

This method may offer the easiest path for Python programmers, as it can be accomplished with very little Javascript.

In addition, data can be prepared prior to the delivery of the web app html, directly on the server, avoiding api calls. Such data could even be embedded into the web app itself, or provided as temporary data files that can be loaded by simple fetch requests (rather than api calls.)

### Pros

Familiar Python tech
Performant and simpler service access via Python

### Cons

Difficult to support more sophisticated client behavior
Good Narrative integration still requires Narrative support

### Ideas

- perhaps narrative support could be via direct api calls; e.g. to store app preferences; this would "work around" the need to use JS to integrate with the Narrative runtime 