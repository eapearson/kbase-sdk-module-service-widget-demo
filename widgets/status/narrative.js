class KBResizeObserver {
    // observedElement: Element;
    // bufferInterval: number;
    // onResize: (width: number, height: number) => void;

    // resizeObserver: ResizeObserver;
    // width: number;
    // height: number;
    // resizes: number;
    // bufferTimer: number | null;
    constructor(
        el,
        bufferInterval,
        onResize
    ) {
        this.observedElement = el;
        this.bufferInterval = bufferInterval;
        this.onResize = onResize;

        this.resizeObserver = new window.ResizeObserver(this.onResized.bind(this));

        const { width, height } = this.outerDimensions();
        this.width = width;
        this.height = height;

        this.bufferTimer = null;
        this.resizes = 0;
        this.resizeObserver.observe(this.observedElement);
    }

    outerDimensions() {
        const rect = this.observedElement.getBoundingClientRect();
        const width = Math.ceil(rect.right - rect.left);
        const height = Math.ceil(rect.bottom - rect.top);
        return {
            width,
            height,
        };
    }

    onResized(entries, observer) {
        const { width, height } = this.outerDimensions();
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

    // observe(el: Element) {

    // }

    // unobserve(el: Element) {

    // }
}
function uuid() {
    return String(Date.now() + '-' + Math.random());
}
function getParamsFromDOM() {
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
    const iframeParams = JSON.parse(decodeURIComponent(params));
    return iframeParams;
}

class Listener {
    constructor({ name, callback, onError }) {
        this.name = name;
        this.callback = callback;
        this.onError = onError;
    }
}
class WaitingListener extends Listener {
    constructor(params) {
        super(params);
        this.started = new Date();
        this.timeout = params.timeout || 5000;
    }
}
class Message {
    constructor({ name, payload, envelope }) {
        this.name = name;
        this.payload = payload;
        this.id = uuid();
        this.created = new Date();
        this.envelope = envelope;
    }
    toJSON() {
        return {
            envelope: this.envelope,
            name: this.name,
            payload: this.payload
        };
    }
}
class WindowChannelInit {
    constructor(params = {}) {
        this.window = params.window || window;
        this.host = params.host || this.window.document.location.origin;
        this.id = params.id || uuid();
    }
    makeChannel(partnerId) {
        return new WindowChannel({
            window: this.window,
            host: this.host,
            id: this.id,
            to: partnerId
        });
    }
    getId() {
        return this.id;
    }
}
class WindowChannel {
    constructor({ window, host, id, to }) {
        this.window = window;
        this.host = host;
        this.id = id;
        this.partnerId = to;
        this.awaitingResponses = new Map();
        this.waitingListeners = new Map();
        this.listeners = new Map();
        this.lastId = 0;
        this.currentListener = null;
        this.running = false;
        this.stats = {
            sent: 0,
            received: 0,
            ignored: 0
        };
    }
    getId() {
        return this.id;
    }
    getPartnerId() {
        return this.partnerId;
    }
    getStats() {
        return this.stats;
    }
    receiveMessage(messageEvent) {
        const message = messageEvent.data;

        if (!message.envelope) {
            this.stats.ignored += 1;
            return;
        }
        if (message.envelope.to !== this.id) {
            this.stats.ignored += 1;
            return;
        }
        this.stats.received += 1;
        if (message.envelope.type === 'reply' && this.awaitingResponses.has(message.envelope.inReplyTo)) {
            const response = this.awaitingResponses.get(message.envelope.inReplyTo);
            this.awaitingResponses.delete(message.envelope.inReplyTo);
            if (response) {
                response.handler(message.envelope.status, message.payload);
            }
            return;
        }
        if (this.waitingListeners.has(message.name)) {
            const awaiting = this.waitingListeners.get(message.name);
            this.waitingListeners.delete(message.name);
            awaiting.forEach((listener) => {
                try {
                    listener.callback(message.payload);
                }
                catch (ex) {
                    if (listener.onError) {
                        listener.onError(ex);
                    }
                }
            });
        }
        const listeners = this.listeners.get(message.name) || [];
        for (const listener of listeners) {
            switch (message.envelope.type) {
                case 'plain':
                    try {
                        return listener.callback(message.payload);
                    }
                    catch (ex) {
                        if (listener.onError) {
                            listener.onError(ex);
                        }
                    }
                    break;
                case 'request':
                    const [ok, err] = (() => {
                        try {
                            return [listener.callback(message.payload), null];
                        }
                        catch (ex) {
                            return [null, {
                                message: ex.message,
                            }];
                        }
                    })();
                    const replyEnvelop = {
                        type: 'reply',
                        from: message.envelope.to,
                        to: message.envelope.from,
                        created: Date.now(),
                        id: uuid(),
                        inReplyTo: message.envelope.id,
                        status: ok ? 'ok' : 'error'
                    };
                    const replyMessage = new Message({
                        envelope: replyEnvelop,
                        name: 'reply',
                        payload: ok || err
                    });
                    this.sendMessage(replyMessage);
            }
        }
    }
    listen(listener) {
        if (!this.listeners.has(listener.name)) {
            this.listeners.set(listener.name, []);
        }
        this.listeners.get(listener.name).push(listener);
    }
    on(messageId, callback, onError) {
        this.listen(new Listener({
            name: messageId,
            callback,
            onError: (error) => {
                if (onError) {
                    onError(error);
                }
            }
        }));
    }
    sendMessage(message) {
        if (!this.running) {
            throw new Error('Not running - may not send ');
        }
        this.stats.sent += 1;
        this.window.postMessage(message.toJSON(), this.host);
    }
    send(name, payload) {
        const envelope = {
            type: 'plain',
            from: this.id,
            to: this.partnerId,
            created: Date.now(),
            id: uuid()
        };
        const message = new Message({ name, payload, envelope });
        this.sendMessage(message);
    }
    sendRequest(message, handler) {
        if (!this.running) {
            throw new Error('Not running - may not send ');
        }
        this.awaitingResponses.set(message.envelope.id, {
            started: new Date(),
            handler
        });
        this.sendMessage(message);
    }
    request(name, payload) {
        return new Promise((resolve, reject) => {
            const envelope = {
                type: 'request',
                from: this.id,
                to: this.partnerId,
                created: Date.now(),
                id: uuid()
            };
            const message = new Message({
                name,
                payload,
                envelope
            });
            this.sendRequest(message, (status, response) => {
                if (status === 'ok') {
                    resolve(response);
                }
                else {
                    reject(new Error(response.message));
                }
            });
        });
    }
    startMonitor() {
        window.setTimeout(() => {
            const now = new Date().getTime();
            for (const [id, listeners] of Array.from(this.waitingListeners.entries())) {
                const newListeners = listeners.filter((listener) => {
                    if (listener instanceof WaitingListener) {
                        const elapsed = now - listener.started.getTime();
                        if (elapsed > listener.timeout) {
                            try {
                                if (listener.onError) {
                                    listener.onError(new Error('timout after ' + elapsed));
                                }
                            }
                            catch (ex) {
                                console.error('Error calling error handler', id, ex);
                            }
                            return false;
                        }
                        else {
                            return true;
                        }
                    }
                    else {
                        return true;
                    }
                });
                if (newListeners.length === 0) {
                    this.waitingListeners.delete(id);
                }
            }
            if (this.waitingListeners.size > 0) {
                this.startMonitor();
            }
        }, 100);
    }
    listenOnce(listener) {
        if (!this.waitingListeners.has(listener.name)) {
            this.waitingListeners.set(listener.name, []);
        }
        this.waitingListeners.get(listener.name).push(listener);
        if (listener.timeout) {
            this.startMonitor();
        }
    }
    once(name, timeout, callback, onError) {
        this.listenOnce(new WaitingListener({
            name: name,
            timeout,
            callback,
            onError: (error) => {
                if (onError) {
                    onError(error);
                }
            }
        }));
    }
    when(name, timeout) {
        return new Promise((resolve, reject) => {
            return this.listenOnce(new WaitingListener({
                name: name,
                timeout: timeout,
                callback: (payload) => {
                    resolve(payload);
                },
                onError: (error) => {
                    reject(error);
                }
            }));
        });
    }
    setPartner(id) {
        this.partnerId = id;
    }
    start() {
        this.currentListener = (message) => {
            this.receiveMessage(message);
        };
        this.window.addEventListener('message', this.currentListener, false);
        this.running = true;
        return this;
    }
    stop() {
        this.running = false;
        if (this.currentListener) {
            this.window.removeEventListener('message', this.currentListener, false);
        }
        return this;
    }
}

export function setup() {
    let iframeParams = getParamsFromDOM();

    if (!iframeParams) {
        console.error('No iframe params');
        throw new Error('No iframe params');
    }

    const hostChannelId = iframeParams.hostChannelId;
    const channelId = iframeParams.pluginChannelId;
    const chan = new WindowChannelInit({ id: channelId });
    const channel = chan.makeChannel(hostChannelId);

    // TODO: once with timeout? 
    let resizeObserver = null;
    channel.on('start', (message) => {
        try {
            resizeObserver = new KBResizeObserver(
                window.document.body,
                100,
                (width, height) => {
                    channel.send('resized', { width, height });
                }
            );
            channel.send('started', { channelId });
        } catch (ex) {
            console.error('ERROR starting', ex);
        }
    });
    channel.start();
    channel.send('ready', {});
}