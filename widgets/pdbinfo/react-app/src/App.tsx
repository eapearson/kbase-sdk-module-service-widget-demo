import { JSONObject } from '@kbase/ui-lib/lib/json';
import { Component } from 'react';
import './App.css';
import PDBTool from './components/PDBTool';
import { NarrativeConfig } from './uiComponents/Develop';
import { NarrativeContextState } from './uiComponents/NarrativeContext';
// import { NiceConfig } from './uiComponents/narrativeTypes';

export interface AppParams {
  genomeRef: string;
  widgetState: {
    tabs: Array<string>,
    selectedTab: string | null,
    searchTerm: string | null
  }
}

export interface AppProps {
  params: AppParams;
  token: string | null;
  config: NarrativeConfig;
  widgetStateUpdated: (widgetState: JSONObject) => void;
}

interface AppState { narrativeState: NarrativeContextState }

export default class App extends Component<AppProps, AppState> {
  render() {
    return <PDBTool
      config={this.props.config}
      token={this.props.token} genomeRef={this.props.params.genomeRef}
      tabs={this.props.params.widgetState.tabs}
      selectedTab={this.props.params.widgetState.selectedTab}
      searchTerm={this.props.params.widgetState.searchTerm}
      widgetStateUpdated={this.props.widgetStateUpdated}
    />
    // return <NarrativeContext.Consumer>
    //   {(value: NarrativeContextState) => {
    //     switch (value.status) {
    //       case AsyncProcessStatus.NONE:
    //       case AsyncProcessStatus.INITIALIZING:
    //         return <Loading message="Loading App..." />
    //       case AsyncProcessStatus.ERROR:
    //         return <ErrorAlert message={value.error.message} />
    //       case AsyncProcessStatus.SUCCESS:
    //         const token = (() => {
    //           if (value.value.message.authentication !== null) {
    //             return value.value.message.authentication.token;
    //           }
    //           return null;
    //         })();
    //         return <PDBTool config={value.value.message.config} token={token} genomeRef="69796/3/1" />
    //       case AsyncProcessStatus.UPDATING:
    //         return <div>FOO</div>
    //     }
    //   }}
    // </NarrativeContext.Consumer>
  }
}
