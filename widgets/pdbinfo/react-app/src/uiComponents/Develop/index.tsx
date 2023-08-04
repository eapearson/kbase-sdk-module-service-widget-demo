import { AuthClient } from "@kbase/ui-lib";
import { JSONObject, isJSONObject } from "@kbase/ui-lib/lib/json";
import Cookies from "js-cookie";
import React, { Component, PropsWithChildren } from "react";
import { v4 as uuidv4 } from 'uuid';
import { DevelopAuthStatus, DevelopAuthentication } from "../DevelopAuth";
import { StartMessage } from "../widgetSupport";
import { WindowChannel, WindowChannelInit } from '../windowChannel';
import View from "./View";


// Okay, this is not pretty, but the narrative config is a bit message too.
export interface ServicesConfig {
    auth: string,
    // awe: string,
    catalog: string,
    // data_import_export: string,
    execution_engine2: string,
    // fba: string,
    // genomeCmp: string,
    groups: string,
    // job_service: string,
    // narrative_job_proxy: string,
    narrative_method_store: string,
    narrative_method_store_image: string,
    sample_service: string,
    // search: string,
    searchapi2: string,
    service_wizard: string,
    // shock: string,
    // transform: string,
    // trees: string,
    // user_and_job_state: string,
    user_profile: string,
    workspace: string,
};
export interface NarrativeConfig {
    services: ServicesConfig,
    auth_cookie: string,
    comm_wait_timeout: number,
    environment: string,
    dev_mode: boolean,
    git_commit_hash: string,
    git_commit_time: number,
    version: string
}


function devConfig(origin: string): NarrativeConfig {
    function serviceURL(servicePath: string): string {
        return `${origin}/services/${servicePath}`
    }
    return {
        services: {
            auth: serviceURL('auth'),
            catalog: serviceURL('catalog'),
            execution_engine2: serviceURL('ee2'),
            groups: serviceURL('groups'),
            narrative_method_store: serviceURL('narrative_method_store/rpc'),
            narrative_method_store_image: serviceURL('narrative_method_store/img'),
            sample_service: serviceURL('samples'),
            searchapi2: serviceURL('search2'),
            service_wizard: serviceURL('service_wizard'),
            user_profile: serviceURL('user_profile'),
            workspace: serviceURL('ws'),
        },
        auth_cookie: 'kbase_session',
        comm_wait_timeout: 1000,
        environment: 'ci',
        dev_mode: true,
        git_commit_hash: 'foo',
        git_commit_time: 0,
        version: '0.0.0'
    }
}

async function calcAuthenticationStatus(): Promise<DevelopAuthentication> {
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
    // TODO: fold into auth client.
    if ('error' in account) {
        throw new Error('Auth Error - TODO');
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

export enum ContextStatus {
    NONE = 'NONE',
    INITIAL = 'INITIAL',
    READY = 'READY'
}

export interface ContextStateBase {
    status: ContextStatus
}

export interface ContextStateNone extends ContextStateBase {
    status: ContextStatus.NONE;
}

export interface ContextStateInitial<T> extends ContextStateBase {
    status: ContextStatus.INITIAL;
    value: T;
}

export interface ContextStateReady<T2> extends ContextStateBase {
    status: ContextStatus.READY;
    value: T2;
}

export type ContextState<T1, T2> = ContextStateNone | ContextStateInitial<T1> | ContextStateReady<T2>;

export interface DevelopContextStateData {
    hostChannelId: string;
    appChannelId: string;
    widgetState: JSONObject | null;
    height: number | null;
    narrativeConfig: NarrativeConfig | null;
    authState: DevelopAuthentication | null;
    appParams: JSONObject | null;
}

export interface DevelopContextState extends DevelopContextStateData {
    updateWidgetState: (newWidgetState: JSONObject) => void;
    updateHeight: (newHeight: number) => void;
    updateNarrativeConfig: (newConfig: NarrativeConfig) => void;
    updateAuthState: (newAuthState: DevelopAuthentication) => void;
    updateAppParams: (newAppParams: JSONObject) => void;
}

// TODO: should not be static
const INITIAL_DEVELOP_CONTEXT_STATE_DATA = {
    hostChannelId: uuidv4(),
    appChannelId: uuidv4(),
    widgetState: null,
    height: null,
    narrativeConfig: devConfig(document.location.origin),
    authState: null,
    appParams: null
}

export const DevelopContext = React.createContext<ContextState<DevelopContextStateData, DevelopContextState>>({
    status: ContextStatus.INITIAL,
    value: INITIAL_DEVELOP_CONTEXT_STATE_DATA
});


export interface ControllerProps extends PropsWithChildren { }

interface ControllerState {
    // authState: DevelopAuthState
    contextState: DevelopContextStateData
}

export interface StartedMessage {
    channelId: string;
}

export type Updater = () => Promise<void>;
export default class Controller extends Component<ControllerProps, ControllerState> {
    channel: WindowChannel | null;
    updateQueue: Array<Updater>;
    queueRunning: boolean;
    constructor(props: ControllerProps) {
        super(props);
        this.state = {
            contextState: INITIAL_DEVELOP_CONTEXT_STATE_DATA
        }

        this.channel = null;
        this.updateQueue = [];
        this.queueRunning = false;
    }

    componentDidMount() {
        this.setupCommunications();
        this.setupAuth();
    }

    componentWillUnmount() {
        if (this.channel !== null) {
            this.channel.stop();
        }
    }
    setupCommunications() {
        const chan = new WindowChannelInit({
            id: INITIAL_DEVELOP_CONTEXT_STATE_DATA.hostChannelId,
            // We use the current window, as does the app we are hosting.
            window,
            host: window.document.location.origin,
        });
        const channel = chan.makeChannel(INITIAL_DEVELOP_CONTEXT_STATE_DATA.appChannelId);
        channel.on('clicked', () => {
            window.document.body.click();
        });

        channel.on('click', () => {
            window.document.body.click();
        });

        channel.on('resized', ({ width, height }) => {
            // if (this.autoResize) {
            // const resizeHeight = Math.ceil(height);
            // console.log('resizing...', this.resizeHeight, this.toolbarHeight);
            // const iframeState = this.state.iframeState;

            // This should always be true if we are here, but TS doesn't
            // know this. May need to refactor to ensure that we don't need
            // such a hack.
            this.setState({
                contextState: {
                    ...this.state.contextState,
                    height: Math.ceil(height)
                }
            });
        });

        channel.once('ready', 100000, async ({ channelId }) => {
            // TODO: necessary? Maybe always just used the predefined
            // app channel id??
            channel.setPartner(channelId || INITIAL_DEVELOP_CONTEXT_STATE_DATA.appChannelId);

            const { widgetState, authState, narrativeConfig, appParams } = this.state.contextState;

            if (authState === null || narrativeConfig === null || appParams === null) {
                console.warn('NOT READY', widgetState, authState, narrativeConfig, appParams);
                return;
            }

            // TODO: this should be typed!
            const startMessage: StartMessage = {
                authentication: authState.status === DevelopAuthStatus.AUTHENTICATED ? authState.authentication : null,
                config: narrativeConfig,
                params: appParams,
                state: widgetState // TODO: improve this
            }

            channel.send('start', startMessage);
        });

        channel.once('started', 1000, (message: StartedMessage) => {
            // TODO: should have initial height, but
            // it is okay for now, so we default.
            // this.setState({
            //     iframeState: {
            //         status: AsyncProcessStatus.SUCCESS,
            //         value: {
            //             params: {
            //                 appChannelId, hostChannelId, channel
            //             },
            //             resizeHeight: 100
            //         }
            //     }
            // })
            // TODO: we need a timer to fail if the hosted app doesn't start.
            //       we would cancel the timer here.
            // TODO: Remove the loading
        });

        channel.on('widget-state', (message: JSONObject) => {
            if (!('widgetState' in message)) {
                return;
            }
            const widgetState = message.widgetState;
            if (!isJSONObject(widgetState)) {
                return;
            }
            this.setState({
                contextState: {
                    ...this.state.contextState,
                    widgetState
                }
            });
        })

        // this.setState({
        //     channel
        // })
        channel.start();
    }
    async setupAuth() {
        const auth = await calcAuthenticationStatus();
        this.updateAuthState(auth);
    }

    runQueue() {
        if (this.queueRunning) {
            return;
        }
        if (this.updateQueue.length === 0) {
            return;
        }

        this.queueRunning = true;
        const queue = this.updateQueue.slice();
        this.updateQueue = [];
        const run = async () => {
            if (queue.length === 0) {
                this.queueRunning = false;
                window.setTimeout(() => {
                    this.runQueue();
                })
                // this.runQueue();
                return;
            }
            const runner = queue.pop()!;
            try {
                await runner();
            } catch (ex) {
                console.error('Error running queue runner', ex);
            } finally {
                run();
            }
        }
        run();
    }

    // Context actions

    updateWidgetState(newWidgetState: JSONObject) {
        this.updateQueue.push(async () => {
            return new Promise((resolve) => {
                this.setState({
                    contextState: {
                        ...this.state.contextState,
                        widgetState: newWidgetState
                    }
                }, () => {
                    return resolve();
                })
            })
        });
        this.runQueue();
    }

    updateHeight(newHeight: number) {
        this.setState({
            contextState: {
                ...this.state.contextState,
                height: newHeight
            }
        })
    }

    updateNarrativeConfig(newConfig: NarrativeConfig) {
        this.setState({
            contextState: {
                ...this.state.contextState,
                narrativeConfig: newConfig
            }
        });

    }
    updateAuthState(newAuthState: DevelopAuthentication) {
        this.setState({
            contextState: {
                ...this.state.contextState,
                authState: newAuthState
            }
        })
    }
    updateAppParams(newAppParams: JSONObject) {
        this.updateQueue.push(async () => {
            return new Promise((resolve) => {
                this.setState({
                    contextState: {
                        ...this.state.contextState,
                        appParams: newAppParams
                    }
                }, () => {
                    return resolve();
                })
            })
        });
        this.runQueue();
    }


    // Renderers
    render() {
        const state: ContextState<DevelopContextStateData, DevelopContextState> = {
            status: ContextStatus.READY,
            value: {
                ...this.state.contextState,
                updateWidgetState: this.updateWidgetState.bind(this),
                updateHeight: this.updateHeight.bind(this),
                updateNarrativeConfig: this.updateNarrativeConfig.bind(this),
                updateAuthState: this.updateAuthState.bind(this),
                updateAppParams: this.updateAppParams.bind(this)
            }
        }
        return <DevelopContext.Provider value={state}>
            <View>{this.props.children}</View>
        </DevelopContext.Provider>
    }
}
