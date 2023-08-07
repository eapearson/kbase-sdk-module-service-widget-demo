import { AuthClient } from '@kbase/ui-lib';
import Cookies from "js-cookie";
import { Component } from "react";
import { Spinner } from "react-bootstrap";
import { AsyncProcess, AsyncProcessStatus } from "../AsyncProcess";
import { NarrativeConfig } from '../Develop';
import ErrorAlert from "../ErrorAlert";
import { SimpleError } from "../widgetSupport";
import View from "./View";


export enum DevelopAuthStatus {
    AUTHENTICATED = 'AUTHENTICATED',
    UNAUTHENTICATED = 'UNAUTHENTICATED'
}

export interface DevelopUserAuthentication {
    token: string;
    username: string;
    realname: string;
    roles: Array<string>;
}

interface DevelopAuthenticationBase {
    status: DevelopAuthStatus;
}

export interface DevelopAuthenticationAuthenticated extends DevelopAuthenticationBase {
    status: DevelopAuthStatus.AUTHENTICATED,
    authentication: DevelopUserAuthentication,
}

export interface DevelopAuthenticationUnauthenticated extends DevelopAuthenticationBase {
    status: DevelopAuthStatus.UNAUTHENTICATED
}


// TODO: Redo as Auth state wrapped in an async state.

export type DevelopAuthentication =
    DevelopAuthenticationAuthenticated |
    DevelopAuthenticationUnauthenticated;


export type DevelopAuthState = AsyncProcess<DevelopAuthentication, SimpleError>;


// Component Props and State

export interface ControllerProps {
    narrativeConfig: NarrativeConfig
}

interface ControllerState {
    process: DevelopAuthState;
}



// Component

export default class Controller extends Component<ControllerProps, ControllerState> {
    constructor(props: ControllerProps) {
        super(props);
        this.state = {
            process: {
                status: AsyncProcessStatus.NONE
            }
        }
    }

    componentDidMount() {
        this.determineAuthenticationStatus();
    }

    // Actions

    async determineAuthenticationStatus() {
        this.setState({
            process: {
                status: AsyncProcessStatus.INITIALIZING
            }
        });
        const token = Cookies.get('kbase_session');
        if (!token) {
            // dispatch(authUnauthenticated());
            this.setState({
                process: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        status: DevelopAuthStatus.UNAUTHENTICATED
                    }
                }
            });
            return;
        }
        // TODO: replace with config...
        // Also, need a better Auth client (e.g. timeout)
        const auth = new AuthClient({ url: `${document.location.origin}/services/auth` })

        // Oh no, an orphan promise!

        try {
            const account = await auth.getMe(token);
            // TODO: fold into auth client.
            if ('error' in account) {
                 this.setState({
                    process: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: 'Auth error TODO y'
                        }
                    }
                 })
                return;
            }

            const roles = account.roles.map(({ id, desc }) => id);
            // dispatch(authAuthenticated(token, account.user, account.display, roles));
            this.setState({
                process: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        status: DevelopAuthStatus.AUTHENTICATED,
                        authentication: {
                            realname: account.display,
                            username: account.user,
                            token: token,
                            roles
                        }
                    }
                }
            })
        } catch (ex) {
            console.error(ex);
            if (ex instanceof Error) {
                this.setState({
                    process: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message
                        }
                    }

                })
            } else {
                this.setState({
                    process: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: 'Unknown error'
                        }
                    }

                })
            }
        }
    }
        
    removeAuthentication() {
        Cookies.remove('kbase_session');
        this.determineAuthenticationStatus()
    }
    addAuthentication(token: string) {
        Cookies.set('kbase_session', token);
        this.determineAuthenticationStatus();
    }

    // Rendering

    render() {
        switch (this.state.process.status) {
            case AsyncProcessStatus.NONE:
                return <div>NONE DEV AUTH</div>;
            case AsyncProcessStatus.INITIALIZING:
                return <Spinner />;
            case AsyncProcessStatus.SUCCESS:
                return <View
                    authState={this.state.process.value}
                    removeAuthentication={this.removeAuthentication.bind(this)}
                    addAuthentication={this.addAuthentication.bind(this)}
                />
            case AsyncProcessStatus.UPDATING:
               return <View
                    authState={this.state.process.value}
                    removeAuthentication={this.removeAuthentication.bind(this)}
                    addAuthentication={this.addAuthentication.bind(this)}
                />
            case AsyncProcessStatus.ERROR:
                return <ErrorAlert message={this.state.process.error.message} />
        }
    }
}