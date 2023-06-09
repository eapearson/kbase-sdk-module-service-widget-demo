export interface IFrameParams {
    hostChannelId: string;
    pluginChannelId: string;
    frameId: string;
    params: {
        // groupsServiceURL: string;
        // userProfileServiceURL: string;
        // workspaceServiceURL: string;
        // serviceWizardURL: string;
        // authServiceURL: string;
        // narrativeMethodStoreURL: string;
        // catalogServiceURL: string;
        // narrativeJobServiceURL: string;
        originalPath: string | null;
        view: string | null;
        viewParams: any;
    };
    parentHost: string;
}

function findHostElement(): Element | null {
    if (window.frameElement) {
        return window.frameElement || null;
    } else {
        return window.document.querySelector('iframe[data-plugin-host="true"]');
    }
}

export function isDevFrame() {
    if (window.frameElement) {
        return false;
    } else {
        return true;
    }
}

export function getParamsFromIFrame() {
    const hostNode = findHostElement();

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

export function getParamsFromDOM() {
    const hostNode = findHostElement();
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

export function getChannelID() {
    const hostNode = findHostElement();

    if (!hostNode) {
        return null;
    }
    if (!hostNode.hasAttribute('data-plugin-channel-id')) {
        return null;
    }
    return hostNode.getAttribute('data-plugin-channel-id');
}

export function getHostChannelID() {
    const hostNode = findHostElement();

    if (!hostNode) {
        return null;
    }
    if (!hostNode.hasAttribute('data-host-channel-id')) {
        return null;
    }
    return hostNode.getAttribute('data-host-channel-id');
}
