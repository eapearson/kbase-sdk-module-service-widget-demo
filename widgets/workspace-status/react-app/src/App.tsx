import { AsyncProcess, AsyncProcessStatus, WindowChannel } from '@kbase/ui-lib';
import { WindowChannelInit } from '@kbase/ui-lib/lib/windowChannel';
import { Component } from 'react';
import { Alert } from 'react-bootstrap';
import './App.css';
import Loading from './components/Loading';
import WSInfo, { SimpleError } from './components/WSInfo';
import { AccountInfo, NiceConfig } from './narrativeTypes';

// function findHostElement(): Element | null {
//     if (window.frameElement) {
//         return window.frameElement || null;
//     } else {
//         return window.document.querySelector('[data-plugin-host="true"]');
//     }
// }

export interface IFrameParams {
    hostChannelId: string;
    pluginChannelId: string;
    // frameId: string;
    //
    parentHost: string;
}

export function getParamsFromDOM() {
    const hostNode = window.frameElement;
    if (!hostNode) {
        return null;
    }

    if (!hostNode.hasAttribute('data-params')) {
        // throw new Error('No params found in window!!');
        return null;
    }
    const params = hostNode.getAttribute('data-params');
    if (params === null) {
        // throw new Error('No params found in window!')
        return null;
    }
    const iframeParams = JSON.parse(decodeURIComponent(params)) as IFrameParams;
    return iframeParams;
}

export interface StartMessage {
    // authentication: {
    //     token: string;
    //     username: string;
    //     realname: string;
    //     roles: Array<string>;
    // };
    // config: {
    //     baseUrl: string;
    //     services: {
    //         Workspace: {
    //             url: string;
    //         };
    //         UserProfile: {
    //             url: string;
    //         };
    //         SampleService: {
    //             url: string;
    //         };
    //         SearchAPI2: {
    //             url: string;
    //         };
    //         SearchAPI2Legacy: {
    //             url: string;
    //         };
    //         ServiceWizard: {
    //             url: string;
    //         };
    //         Auth: {
    //             url: string;
    //         };
    //         NarrativeMethodStore: {
    //             url: string;
    //         };
    //         Catalog: {
    //             url: string;
    //         };
    //         NarrativeJobService: {
    //             url: string;
    //         };
    //         RelationEngine: {
    //             url: string;
    //         };
    //     };
    // };
    auth: { accountInfo: AccountInfo; token: string };
    config: NiceConfig;
    channel: WindowChannel;
}

export interface AppProps {}

export interface StartState {
    message: StartMessage;
    channel: WindowChannel;
}

interface AppState {
    start: AsyncProcess<StartState, SimpleError>;
}

class KBResizeObserver {
    observedElement: Element;
    bufferInterval: number;
    onResize: (width: number, height: number) => void;

    resizeObserver: ResizeObserver;
    width: number;
    height: number;
    resizes: number;
    bufferTimer: number | null;
    constructor(
        el: Element,
        bufferInterval: number,
        onResize: (width: number, height: number) => void
    ) {
        this.observedElement = el;
        this.bufferInterval = bufferInterval;
        this.onResize = onResize;

        this.resizeObserver = new window.ResizeObserver(this.onResized.bind(this));

        const { width, height } = this.outerDimensions(this.observedElement);
        this.width = width;
        this.height = height;

        this.bufferTimer = null;
        this.resizes = 0;
        this.resizeObserver.observe(this.observedElement);
    }

    outerDimensions(el: Element) {
        const rect = el.getBoundingClientRect();
        const width = Math.ceil(rect.right - rect.left);
        const height = Math.ceil(rect.bottom - rect.top);
        return {
            width,
            height,
        };
    }

    onResized(entries: Array<ResizeObserverEntry>, observer: ResizeObserver) {
        const { width, height } = this.outerDimensions(this.observedElement);
        this.width = width;
        this.height = height;
        this.resizes += 1;
        if (this.bufferTimer) {
            return;
        }
        this.bufferTimer = window.setTimeout(this.resizeTriggered.bind(this), this.bufferInterval);
    }

    resizeTriggered() {
        this.bufferTimer = null;
        this.onResize(this.width, this.height);
        this.resizes = 0;
    }

    done() {
        this.resizeObserver.unobserve(this.observedElement);
    }
}

export default class App extends Component<AppProps, AppState> {
    resizeObserver: KBResizeObserver | null;
    constructor(props: AppProps) {
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
        const channelId = iframeParams.pluginChannelId;
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
        return <Loading message="Loading App..." />;
    }

    renderError(error: SimpleError) {
        return <Alert variant="error">{error.message}</Alert>;
    }

    renderSuccess({ message }: StartState) {
        return <WSInfo message={message} />;
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
