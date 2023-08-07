import { AsyncProcess, AsyncProcessStatus, WindowChannel } from '@kbase/ui-lib';
import { WindowChannelInit } from '@kbase/ui-lib/lib/windowChannel';
import { Component, PropsWithChildren } from 'react';
import { Alert } from 'react-bootstrap';
import KBResizeObserver from './KBResizeObserver';
import Loading from './Loading';
import { SimpleError, StartMessage, getParamsFromDOM } from './widgetSupport';

export interface AppWrapperProps extends PropsWithChildren { }

export interface StartState {
    message: StartMessage;
    channel: WindowChannel;
}

interface AppWrapperState {
    start: AsyncProcess<StartState, SimpleError>;
}

export default class AppWrapper extends Component<AppWrapperProps, AppWrapperState> {
    resizeObserver: KBResizeObserver | null;
    constructor(props: AppWrapperProps) {
        super(props);

        this.resizeObserver = null;

        this.state = {
            start: {
                status: AsyncProcessStatus.NONE,
            },
        };

        this.start();
    }

    start() {
        this.setState({
            start: {
                status: AsyncProcessStatus.PENDING,
            },
        });
        let iframeParams = getParamsFromDOM();

        if (!iframeParams) {
            this.setState({
                start: {
                    status: AsyncProcessStatus.ERROR,
                    error: {
                        message: 'No iframe params',
                    },
                },
            });
            return;
        }

        const hostChannelId = iframeParams.hostChannelId;
        const channelId = iframeParams.appChannelId;
        const chan = new WindowChannelInit({ id: channelId });
        const channel = chan.makeChannel(hostChannelId);

        // TODO: once with timeout?
        channel.on('start', (message: StartMessage) => {
            this.setState({
                start: {
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
        channel.send('ready', {});
        return channel;
    }

    componentWillUnmount(): void {
        if (this.resizeObserver) {
            this.resizeObserver.done();
        }
    }

    renderLoading() {
        return <Loading message="Loading App Wrapper..." />;
    }

    renderError(error: SimpleError) {
        return <Alert variant="error">{error.message}</Alert>;
    }

    renderSuccess({ message }: StartState) {
        return this.props.children;
    }

    renderState() {
        switch (this.state.start.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.start.error);
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess(this.state.start.value);
        }
    }

    render() {
        return <div className="App">{this.renderState()}</div>;
    }
}
