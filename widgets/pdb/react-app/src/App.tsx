import { Component } from 'react';
import './App.css';
import PDBTool from './components/PDBTool';
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
            console.log('hmm', value.value.message);
            return <PDBTool config={value.value.message.config} token={value.value.message.authentication.token} />
          case AsyncProcessStatus.UPDATING:
             return <div>FOO</div>
        }
      }}
    </NarrativeContext.Consumer>
  }
}
