import { JSONObject } from "@kbase/ui-lib/lib/json";
import { NarrativeConfig } from "./Develop";
import { Authentication } from "./narrativeTypes";

export interface IFrameParams {
    hostChannelId: string;
    appChannelId: string;
    parentHost: string;
}

function findHostElement(): Element | null {
    if (window.frameElement) {
        return window.frameElement || null;
    } else {
        return document.querySelector('[data-app-host="true"]');
    }
}

export function getParamsFromDOM() {
    const hostNode = findHostElement();
    if (!hostNode) {
        console.warn('No data-app-host');
        return null;
    }

    const params = hostNode.getAttribute('data-params');
    if (params === null) {
        console.warn('no data-params')
        return null;
    }
    return JSON.parse(decodeURIComponent(params)) as IFrameParams;
}

export interface StartMessage {
    authentication: Authentication | null;
    // TODO: use NiceConfig
    config: NarrativeConfig;
    params: JSONObject,
    state: JSONObject | null
}

export interface SimpleError {
    message: string;
}
