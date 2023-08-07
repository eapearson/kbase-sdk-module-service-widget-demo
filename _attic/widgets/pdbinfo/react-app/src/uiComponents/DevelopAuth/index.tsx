import AuthClient from '../../lib/AuthClient';
import Cookies from "js-cookie";
import { Component } from "react";
import { Spinner } from "react-bootstrap";
import { AsyncProcess, AsyncProcessStatus } from "../AsyncProcess";
import { ContextStatus, DevelopContext } from '../Develop';
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
    // narrativeConfig: NarrativeConfig
    // appParams: JSONObject
    // widgetState: JSONObject
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
                console.log('error', account);
                switch (account.error.appcode) {
                    case 10020:
                        this.setState({
                            process: {
                                status: AsyncProcessStatus.ERROR,
                                error: {
                                    message: 'Invalid token'
                                }
                            }
                        });
                        break;
                    default:
                        this.setState({
                            process: {
                                status: AsyncProcessStatus.ERROR,
                                error: {
                                    message: 'Auth error TODO a'
                                }
                            }
                        })
                }

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

    async calcAuthenticationStatus(): Promise<DevelopAuthentication> {
        // this.setState({
        //     process: {
        //         status: AsyncProcessStatus.INITIALIZING
        //     }
        // });
        const token = Cookies.get('kbase_session');
        if (!token) {
            // dispatch(authUnauthenticated());
            return {
                status: DevelopAuthStatus.UNAUTHENTICATED
            }
        }
        // TODO: replace with config...
        // Also, need a better Auth client (e.g. timeout)

        const auth = new AuthClient({ url: `${document.location.origin}/services/auth` })



        // Oh no, an orphan promise!

        const account = await auth.getMe(token);
        console.log('HERE!', account);
        // TODO: fold into auth client.
        if ('error' in account) {
            console.log('Error', account);
            throw new Error('Auth Error - TODO');
            // this.setState({
            //     process: {
            //         status: AsyncProcessStatus.ERROR,
            //         error: {
            //             message: 'Auth error TODO'
            //         }
            //     }
            // })
            // return;
        }

        const roles = account.roles.map(({ id, desc }) => id);
        // dispatch(authAuthenticated(token, account.user, account.display, roles));
        return {
            status: DevelopAuthStatus.AUTHENTICATED,
            authentication: {
                realname: account.display,
                username: account.user,
                token: token,
                roles
            }
        };

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

        return <DevelopContext.Consumer>
            {(contextValue) => {
                if (contextValue.status !== ContextStatus.READY) {
                    return;
                }
                const { narrativeConfig, updateAuthState } = contextValue.value;

                if (narrativeConfig == null) {
                    console.warn('DEVELOP AUTH - NULL CONTEXT VALUES');
                    return;
                }

                const removeAuthentication = async () => {
                    Cookies.remove('kbase_session');
                    const newAuth = await this.calcAuthenticationStatus();
                    updateAuthState(newAuth);
                }

                const addAuthentication = async (token: string) => {
                    Cookies.set('kbase_session', token);
                    const newAuth = await this.calcAuthenticationStatus();
                    updateAuthState(newAuth);
                }

                switch (this.state.process.status) {
                    case AsyncProcessStatus.NONE:
                        return <div>NONE DEV AUTH</div>;
                    case AsyncProcessStatus.INITIALIZING:
                        return <Spinner />;
                    case AsyncProcessStatus.SUCCESS:
                        return <View
                            // narrativeConfig={narrativeConfig}
                            authState={this.state.process.value}
                            removeAuthentication={removeAuthentication}
                            addAuthentication={addAuthentication}
                        // appParams={appParams}
                        // widgetState={widgetState}
                        />
                    case AsyncProcessStatus.UPDATING:
                        return <View
                            authState={this.state.process.value}
                            // narrativeConfig={this.props.narrativeConfig}
                            removeAuthentication={removeAuthentication}
                            addAuthentication={addAuthentication}
                        // appParams={this.props.appParams}
                        // widgetState={this.props.widgetState}
                        />
                    case AsyncProcessStatus.ERROR:
                        return <ErrorAlert message={this.state.process.error.message} />
                }
            }}
        </DevelopContext.Consumer>


        // switch (this.state.process.status) {
        //     case AsyncProcessStatus.NONE:
        //         return <div>NONE DEV AUTH</div>;
        //     case AsyncProcessStatus.INITIALIZING:
        //         return <Spinner />;
        //     case AsyncProcessStatus.SUCCESS:
        //         return <View
        //             narrativeConfig={this.props.narrativeConfig}
        //             authState={this.state.process.value}
        //             removeAuthentication={this.removeAuthentication.bind(this)}
        //             addAuthentication={this.addAuthentication.bind(this)}
        //             appParams={this.props.appParams}
        //             widgetState={this.props.widgetState}
        //         >
        //             {this.props.children}
        //         </View>
        //     case AsyncProcessStatus.UPDATING:
        //         return <View
        //             authState={this.state.process.value}
        //             narrativeConfig={this.props.narrativeConfig}
        //             removeAuthentication={this.removeAuthentication.bind(this)}
        //             addAuthentication={this.addAuthentication.bind(this)}
        //             appParams={this.props.appParams}
        //             widgetState={this.props.widgetState}
        //         >
        //             {this.props.children}
        //         </View>
        //     case AsyncProcessStatus.ERROR:
        //         return <ErrorAlert message={this.state.process.error.message} />
        // }
    }
}