import { Component, PropsWithChildren } from 'react';
import { Alert } from 'react-bootstrap';
import { AsyncProcessStatus } from './AsyncProcess';
import KBResizeObserver from './KBResizeObserver';
import Loading from './Loading';
import { NarrativeContext, NarrativeContextData, NarrativeContextState } from './NarrativeContext';
import { getParamsFromDOM, SimpleError, StartMessage } from './widgetSupport';
import { WindowChannel, WindowChannelInit } from './windowChannel';

export interface NarrativeContextWrapperProps extends PropsWithChildren {}


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

        const hostChannelId = iframeParams.hostChannelId;
        const channelId = iframeParams.pluginChannelId;
        const chan = new WindowChannelInit({ id: channelId });
        const channel = chan.makeChannel(hostChannelId);
        this.channel = channel;

        // TODO: once with timeout?
        channel.once('start', 1000, (message: StartMessage) => {
            console.log('started!')
            this.setState({
                narrativeContextState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: { message, channel },
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

        channel.start();

        console.log('sending ready...');
        channel.send('ready', {channelId: channel.getId()});
    }

    componentWillUnmount(): void {
        if (this.resizeObserver) {
            this.resizeObserver.done();
        }
    }

    renderLoading() {
        return <Loading message="Loading App..." />;
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
        return <NarrativeContext.Provider value={this.state.narrativeContextState}>
            {this.props.children}
        </NarrativeContext.Provider>
        // return <div className="App">{this.renderState()}</div>;
    }
}
