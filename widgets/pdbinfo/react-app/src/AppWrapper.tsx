import { isJSONObject } from '@kbase/ui-lib/lib/json';
import { Component } from 'react';
import App, { AppParams } from './App';
import './App.css';
import { AsyncProcessStatus } from './uiComponents/AsyncProcess';
import ErrorAlert from './uiComponents/ErrorAlert';
import Loading from './uiComponents/Loading';
import { NarrativeContext, NarrativeContextState } from './uiComponents/NarrativeContext';

export interface AppWrapperProps {
}

interface AppWrapperState { narrativeState: NarrativeContextState }

export default class AppWrapper extends Component<AppWrapperProps, AppWrapperState> {
    render() {
        return <NarrativeContext.Consumer>
            {(value: NarrativeContextState) => {
                switch (value.status) {
                    case AsyncProcessStatus.NONE:
                    case AsyncProcessStatus.INITIALIZING:
                        return <Loading message="Initializing App Wrapper..." />
                    case AsyncProcessStatus.ERROR:
                        return <ErrorAlert message={value.error.message} />
                    case AsyncProcessStatus.SUCCESS:
                        const token = (() => {
                            if (value.value.message.authentication !== null) {
                                return value.value.message.authentication.token;
                            }
                            return null;
                        })();

                        // Decode params, and stuff into our structure
                        // This is the "eye of the needle" for params.
                        // TODO: make some general-purpose type narrowing functions to 
                        // extract values out of the JSONObject which is the params.
                        const genomeRef = (() => {
                            if ('ref' in value.value.message.params) {
                                const genomeRef = value.value.message.params.ref
                                if (typeof genomeRef !== 'string') {
                                    throw new Error(`Expected "ref" to be string, is ${typeof genomeRef}`)
                                }
                                return genomeRef;
                            }
                            throw new Error('"ref" not provided in params');
                        })();
                        const tabs = ((): Array<string> => {
                            if (!value.value.message.state) {
                                return [];
                            }
                            const widgetState = value.value.message.state;
                            if (!isJSONObject(widgetState)) {
                                throw new Error(`expected "state" to be a JSON object, it is not`);
                            }
                            if ('tabs' in widgetState) {
                                const tabs = widgetState.tabs
                                if (!(tabs instanceof Array)) {
                                    throw new Error(`expected "tabs" to be an array, it is not`)
                                }
                                // This business is because a simple for loop with a 
                                // type assertion like typeof tab === "string" doesn't prove
                                // to TS that tabs is an array of string.
                                return tabs.map((tab) => {
                                    if (typeof tab !== 'string') {
                                        throw new Error(`Expected "tab" to be string, is ${typeof tab}`)
                                    }
                                    return tab;
                                });
                            }
                            return [];
                        })();
                        const selectedTab = ((): string | null => {
                            if (value.value.message.state && 'selectedTab' in value.value.message.state) {
                                return value.value.message.state.selectedTab as string;
                            }
                            return null;
                        })();
                        const searchTerm = ((): string | null => {
                            if (value.value.message.state && 'searchTerm' in value.value.message.state) {
                                return value.value.message.state.searchTerm as string;
                            }
                            return null;
                        })();
                        const params: AppParams = {
                            genomeRef, widgetState: { tabs, selectedTab, searchTerm }
                        }
                        return <App
                            config={value.value.message.config}
                            token={token} params={params}
                            widgetStateUpdated={value.value.widgetStateUpdated}
                        />
                    case AsyncProcessStatus.UPDATING:
                        return <div>FOO</div>
                }
            }}
        </NarrativeContext.Consumer>
    }
}
