function getParamsFromWindow() {
    const hostNode = window.frameElement;
    if (!hostNode) {
        return null;
    }

    if (!hostNode.hasAttribute('data-params')) {
        return null;
    }
    const params = hostNode.getAttribute('data-params');
    if (params === null) {
        return null;
    }
    return JSON.parse(decodeURIComponent(params));
}

class SimpleWindowChannel {
    constructor({channelId, partnerChannelId, targetOrigin}) {
        this.channelId = channelId;
        this.partnerChannelId = partnerChannelId;
        this.targetOrigin = targetOrigin || window.location.origin;

        this.listeners = [];
        this.incoming = [];

        this.status = "ready";
    }

    scheduleReceiveHandling() {
        if (this.status === "scheduled") {
            return;
        }
        window.setTimeout(() => {
            this.handleIncoming();
        }, 100);
    }

    handleIncoming() {
        const incomingMessages = this.incoming;
        this.incoming = [];

        const newListeners = [];

        for (const incomingMessage of incomingMessages) {
            for (const {name, once, listener} of this.listeners) {
                if (incomingMessage.name === name) {
                    try {
                        if (!once) {
                            newListeners.push({name, listener})
                        }
                        listener(incomingMessage.payload);
                    } catch (ex) {
                        console.error('Error processing message with listener', ex);
                    }
                }
            }
        }

        this.listeners = newListeners;
    }

    receiveMessage({data}) {
        if (!('envelope' in data)) {
            return;
        }
        if (data.envelope.to !== this.channelId) {
            return;
        }

        // skip message types, for now at least.
        this.incoming.push(data);
        this.scheduleReceiveHandling()
    }

    on(name, listener) {
        this.listeners.push({
            name, listener
        });
    }

    once(name, listener) {
        this.listeners.push({
            name, once: true, listener
        });
    }

    send(name, payload) {
         const envelope = {
            type: 'plain',
            from: this.channelId,
            to: this.partnerChannelId
        };
        const message = { name, payload, envelope };
        console.log('SENDING', message);
        window.postMessage(message, this.targetOrigin);
    }

    start() {
        this.currentListener = (message) => {
            console.log('CURRENT LISTENER', message);
            this.receiveMessage(message);
        };
        window.addEventListener('message', this.currentListener, false);
    }

    stop() {
        if (!this.currentListener) {
            return;
        }
        window.removeEventListener('message', this.currentListener);
        this.currentListener = null;
    }
}

/*
{
	"authentication": {
		"token": "RSLDQ6TIQ2IU7MBG4VITA72PMETJGA54",
		"username": "eapearson",
		"realname": "Erik A. Pearson",
		"roles": ["Admin", "DevToken", "ServToken"]
	},
	"config": {
		"services": {
			"auth": "https://ci.kbase.us/services/auth",
			"awe": "https://ci.kbase.us/services/awe-api",
			"catalog": "https://ci.kbase.us/services/catalog",
			"data_import_export": "https://ci.kbase.us/services/data_import_export",
			"execution_engine2": "https://ci.kbase.us/services/ee2",
			"fba": "https://ci.kbase.us/services/KBaseFBAModeling/",
			"genomeCmp": "https://ci.kbase.us/services/genome_comparison/jsonrpc",
			"groups": "https://ci.kbase.us/services/groups",
			"job_service": "https://ci.kbase.us/services/njs_wrapper",
			"narrative_method_store": "https://ci.kbase.us/services/narrative_method_store/rpc",
			"narrative_method_store_image": "https://ci.kbase.us/services/narrative_method_store/",
			"sample_service": "https://ci.kbase.us/services/sampleservice",
			"search": "https://ci.kbase.us/services/search/getResults",
			"searchapi2": "https://ci.kbase.us/services/searchapi2/rpc",
			"service_wizard": "https://ci.kbase.us/services/service_wizard",
			"shock": "https://ci.kbase.us/services/shock-api",
			"transform": "https://ci.kbase.us/services/transform",
			"trees": "https://ci.kbase.us/services/trees",
			"user_and_job_state": "https://ci.kbase.us/services/userandjobstate",
			"user_profile": "https://ci.kbase.us/services/user_profile/rpc",
			"workspace": "https://ci.kbase.us/services/ws"
		},
		"auth_cookie": "kbase_session",
		"comm_wait_timeout": 600000,
		"environment": "ci",
		"dev_mode": true,
		"git_commit_hash": "ea0ccabf8",
		"git_commit_time": "Tue Apr 11 07:18:51 2023 -0700",
		"version": "5.1.4"
	},
	"params": {
		"ref": "69000/5/1"
	},
	"state": null
}
 */
function app(rootNode, api, initialState) {
    console.log('INITIAL STATE', JSON.stringify(initialState));
    const  { authentication: {username, realname}} = initialState;
    rootNode.innerText = `Hello, ${realname}; aka ${username}.`;
}

function main() {
    const rootNode = document.getElementById('root')
    if (!rootNode) {
        throw new Error('Root node not found');
    }

    const params = getParamsFromWindow();
    if (params === null) {
        rootNode.innerText = 'No params - not running in narrative iframe?';
    }

    console.log('params?', params);


    rootNode.innerText ='Loading...';

    const channel = new SimpleWindowChannel({
        channelId: params.pluginChannelId,
        partnerChannelId: params.hostChannelId,
        targetOrigin: window.location.origin
    });
    channel.start();

    channel.once('start', (initialState) => {
        app(rootNode, {}, initialState);
    });

    channel.send('ready', {});
}

try {
    window.addEventListener("DOMContentLoaded", (ev) => {
        main();
    })
} catch (ex) {
    document.write(`Error starting app: ${ex.message}`);
}