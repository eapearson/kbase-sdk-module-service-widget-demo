# Remote Widgets

## How To

prerequisities:

- nodejs, perhaps nvm
- use node 18

Unless already globally set:

```shell
nvm use 18
```

Create the initial app. Choose a directory; traditionally we use `react-app`:

```shell
npx create-react-app react-app --template typescript
```

where `react-app` is the root directory of the app.

fire it up!

```shell
npm run test
npm run start
```

Add our dependencies to `package.json`:

```shell
npm add --save @kbase/ui-lib bootstrap react-bootstrap es-cookie @fortawesome/free-solid-svg-icons @fortawesome/free-regular-svg-icons @fortawesome/react-fontawesome@latest
```

> TODO: after we establish the minimal support requirements, package as a npm package and include above.

fix up the package.json

- remove ^
- set all packages to latest version

edit `tsconfig`:

- set `target` to `es6`

## wrap for narrative

### replace App.tsx with

```typescript
import { Component } from 'react';
import './App.css';

export interface AppProps { }

interface AppState { }

export default class App extends Component<AppProps, AppState> {
  render() {
    return <div>FOO</div>
    
  }
}
```


### Add bootstrap to index.tsx

```typescript
import 'bootstrap/dist/css/bootstrap.min.css';
```

### Add AppWrapper to index.tsx

```typescript
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import AppWrapper from './uiComponents/AppWrapper';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppWrapper>
      <App />
    </AppWrapper>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

```


Now run the web app again:

```shell
npm run start 
```

Note the spinner that reads "Loading App..."?

This FOO inside App.tsx is not displaying. What gives?

Have no fear, you should be happy! The loading spinner indicates that the App is running as expected -- bootstrap is working, the integration layer is half-way working.

The integration layer is awaiting a response from the Narrative. That response will include the current authentication and configuration from the narrative.

We could, with just a bit more work, run this directly in the Narrative. But we have an easier way. The narrative integration support provides a mock-narrative component which simulates the narrative support, and also allows you to control authentication and configuration.



### Add integration to index.tsx

```typescript
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import NarrativeContextWrapper from './uiComponents/NarrativeContextWrapper';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <NarrativeContextWrapper>
      <App />
    </NarrativeContextWrapper>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
```


### Add integration to App.tsx

```typescript
import { Component } from 'react';
import './App.css';
import { AsyncProcessStatus } from './uiComponents/AsyncProcess';
import ErrorAlert from './uiComponents/ErrorAlert';
import Loading from './uiComponents/Loading';
import { NarrativeContext, NarrativeContextState } from './uiComponents/NarrativeContext';

export interface AppProps { }

interface AppState { narrativeState: NarrativeContextState }

export default class App extends Component<AppProps, AppState> {
  render() {
    return <NarrativeContext.Consumer>
      {(value: NarrativeContextState) => {
        switch (value.status) {
          case AsyncProcessStatus.NONE:
          case AsyncProcessStatus.INITIALIZING:
            return <Loading message="Loading App..." />
          case AsyncProcessStatus.ERROR:
            return <ErrorAlert message={value.error.message} />
          case AsyncProcessStatus.SUCCESS:
             return <div>FOO</div>
          case AsyncProcessStatus.UPDATING:
             return <div>FOO</div>
        }
      }}
    </NarrativeContext.Consumer>

  }
}
```


But now we get an error, "No iframe params".

This is because the integration expects the app to be wrapped in an iframe as the Narrative will do. The iframe provides both isolation, as the web app runs in an isolated sub-window, but then adds back in integration. The integration is jump-started with a "data-param" attribute, which is what the error is referring to.

So, the next step is to add a simulation of the Narrative iframe and Narrative-side integration support.

> LEFT OFF HERE

will need to re-document later, more things to add like, the dev wrapper, etc.



dev setup:

start kbase-dynamic-service-widget-demo

start this app with port 4000 (port 3000 gets mixed up with kbase-ui somehow...)

pull up browser to http://localhost:4000

rock and roll!