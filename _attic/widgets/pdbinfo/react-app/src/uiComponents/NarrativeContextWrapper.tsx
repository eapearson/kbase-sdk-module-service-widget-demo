import { JSONObject } from '@kbase/ui-lib/lib/json';
import { Component, PropsWithChildren } from 'react';
import { Alert } from 'react-bootstrap';
import { AsyncProcessStatus } from './AsyncProcess';
import KBResizeObserver from './KBResizeObserver';
import Loading from './Loading';
import { NarrativeContext, NarrativeContextData, NarrativeContextState } from './NarrativeContext';
import { SimpleError, StartMessage, getParamsFromDOM } from './widgetSupport';
import { WindowChannel, WindowChannelInit } from './windowChannel';

export interface NarrativeContextWrapperProps extends PropsWithChildren { }

interface NarrativeContextWrapperState {
    narrativeContextState: NarrativeContextState;
}

export default class NarrativeContextWrapper extends Component<NarrativeContextWrapperProps, NarrativeContextWrapperState> {
    resizeObserver: KBResizeObserver | null = null;
    channel: WindowChannel | null = null;
    constructor(props: NarrativeContextWrapperProps) {
        super(props);

        this.state = {
            narrativeContextState: {
                status: AsyncProcessStatus.NONE,
            },
        };
    }

    componentDidMount() {
        this.start();
    }

    start() {
        this.setState({
            narrativeContextState: {
                status: AsyncProcessStatus.INITIALIZING,
            },
        });
        let iframeParams = getParamsFromDOM();

        if (!iframeParams) {
            this.setState({
                narrativeContextState: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message: 'No iframe params',
                    },
                },
            });
            return;
        }

        console.log('here', iframeParams);

        const hostChannelId = iframeParams.hostChannelId;
        const channelId = iframeParams.appChannelId;
        const chan = new WindowChannelInit({ id: channelId });
        const channel = chan.makeChannel(hostChannelId);
        this.channel = channel;

        // TODO: make message handler generic wrt type
        // so channel.once<Startmessage>('start', ..)
        channel.once('start', 100000, (message: StartMessage) => {
            console.log('received start', message);
            const widgetStateUpdated = (widgetState: JSONObject) => {
                console.log('widget state updated?', widgetState);
                channel.send('widget-state', { widgetState });
            };

            console.log('in start', message);

            this.setState({
                narrativeContextState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: { message, channel, widgetStateUpdated },
                },
            });

            this.resizeObserver = new KBResizeObserver(
                window.document.body,
                100,
                (width: number, height: number) => {
                    channel.send('resized', { width, height });
                }
            );

            channel.send('started', { channelId });
        });

        console.log('about to start channel.')

        channel.start();
        channel.send('ready', { channelId: channel.getId() });
    }

    widgetStateUpdated(widgetState: JSONObject) {
        if (this.channel === null) {
            return;
        }
        this.channel.send('widget-state', { widgetState });
    }

    // updateWidgetState(widgetState: JSONObject) {
    //     if (this.channel === null) {
    //         return;
    //     }
    //     this.channel.send('widget-state', {
    //         state: widgetState
    //     });
    // }

    componentWillUnmount(): void {
        if (this.resizeObserver) {
            this.resizeObserver.done();
        }
    }

    renderLoading() {
        return <Loading message="Loading Narrative Context Wrapper..." />;
    }

    renderError(error: SimpleError) {
        return <Alert variant="error">{error.message}</Alert>;
    }

    renderSuccess({ message }: NarrativeContextData) {
        return this.props.children;
    }

    renderUpdating({ message }: NarrativeContextData) {
        return this.props.children;
    }

    renderState() {
        const state = this.state.narrativeContextState;
        switch (state.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.INITIALIZING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(state.error);
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(state.value);
            case AsyncProcessStatus.UPDATING:
                return this.renderUpdating(state.value);
        }
    }

    render() {
        // const kids = React.Children.map(this.props.children, (child) => {
        //     if (React.isValidElement(child)) {
        //         return React.cloneElement(child, {
        //             widgetStateUpdated: this.widgetStateUpdated
        //         })
        //     }
        // })

        return <NarrativeContext.Provider value={this.state.narrativeContextState}>
            {this.props.children}
        </NarrativeContext.Provider>
        // return <div className="App">{this.renderState()}</div>;
    }
}
