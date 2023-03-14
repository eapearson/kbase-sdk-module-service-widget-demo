
import { Component, PropsWithChildren } from "react";
import { v4 as uuidv4 } from 'uuid';
import { AsyncProcess } from "../AsyncProcess";
import { NarrativeConfig } from "../Develop";
import { DevelopAuthentication, DevelopAuthStatus, DevelopUserAuthentication } from "../DevelopAuth";
import ErrorAlert from "../ErrorAlert";
import Loading from "../Loading";
import { SimpleError } from "../widgetSupport";
import { WindowChannel, WindowChannelInit } from "../windowChannel";
import View from "./View";


// Very much like AuthState, but meant to be used in the iframe params
export interface AuthParamBase {
    status: 'authenticated' | 'unauthenticated'
}

export interface AuthParamAuthenticated extends AuthParamBase {
    status: 'authenticated',
    authentication: DevelopUserAuthentication
}

export interface AuthParamUnauthenticated extends AuthParamBase {
    status: 'unauthenticated'
}

export type AuthParam = AuthParamAuthenticated | AuthParamUnauthenticated;

export interface IFrameParams {
    hostChannelId: string;
    appChannelId: string;
    channel: WindowChannel
}

export interface IFrameState {
    params: IFrameParams;
    resizeHeight: number | null;
}

export type IFrameProcessState = AsyncProcess<IFrameState, SimpleError>;

const APP_STARTUP_TIMEOUT = 1000;

// Messages

export interface StartedMessage {
    channelId: string; 
}

// Component

export interface ControllerProps extends PropsWithChildren {
    narrativeConfig: NarrativeConfig;
    authState: DevelopAuthentication
}

interface ControllerState {
    channel: WindowChannel | null
    height: number | null
}

export default class FakeIFrame extends Component<ControllerProps, ControllerState> {
    hostChannelId: string;
    appChannelId: string;
    constructor(props: ControllerProps) {
        super(props);
        this.hostChannelId = uuidv4();
        this.appChannelId = uuidv4();
        this.state = {
            channel: null, height: null
        }
    }

    componentDidMount() {
        this.setupCommunications();
    }

    componentWillUnmount() {
        if (this.state.channel !== null) {
            this.state.channel.stop();
        }
    }

    fakeIFrameLoaded() {
    }

    setupCommunications() {
        // Left off here .. um, this isn't right.
        // THe channel ids have gotta be stamped already.

        const chan = new WindowChannelInit({
            id: this.hostChannelId,
            // We use the current window, as does the app we are hosting.
            window,
            host: window.document.location.origin,
        });
        const channel = chan.makeChannel(this.appChannelId);
        channel.on('clicked', () => {
            window.document.body.click();
        });

        channel.on('click', () => {
            window.document.body.click();
        });

        channel.on('resized', ({width, height}) => {
            // if (this.autoResize) {
            // const resizeHeight = Math.ceil(height);
            // console.log('resizing...', this.resizeHeight, this.toolbarHeight);
            // const iframeState = this.state.iframeState;

            // This should always be true if we are here, but TS doesn't
            // know this. May need to refactor to ensure that we don't need
            // such a hack.
            console.log('resized?', height);
            this.setState({
                height: Math.ceil(height)
            })
        })

        channel.once('ready', 1000, async ({ channelId }) => {
            // TODO: necessary? Maybe always just used the predefined
            // app channel id??
            channel.setPartner(channelId || this.appChannelId);

            // TODO: this should be typed!
            const startMessage = {
                authentication: this.props.authState.status === DevelopAuthStatus.AUTHENTICATED ? this.props.authState.authentication : null,
                config: this.props.narrativeConfig
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

        this.setState({
            channel
        })
        channel.start();
    }

    makeAuthParam(): AuthParam {
        switch (this.props.authState.status) {
            case DevelopAuthStatus.AUTHENTICATED:
                return {
                    status: 'authenticated',
                    authentication: this.props.authState.authentication
                }
            case DevelopAuthStatus.UNAUTHENTICATED:
                return {
                    status: 'unauthenticated'
                }
        }
    }

    renderLoading() {
        return <Loading message="Setting up Narrative <-> iFrame Communication..." />
    }

    renderError(error: SimpleError) {
        return <ErrorAlert message={error.message} />
    }
    
    render() {
        if (this.state.channel === null) {
            return;
        }
        return <View
            hostChannelId={this.hostChannelId}
            appChannelId={this.appChannelId}
            height={this.state.height || 100}
            hasLoaded={this.fakeIFrameLoaded.bind(this)}
        >
            {this.props.children}
        </View>
    }
}