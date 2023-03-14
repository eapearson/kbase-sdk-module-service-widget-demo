import { WindowChannel } from "@kbase/ui-lib";
import { Authentication, NiceConfig } from "./narrativeTypes";

export interface IFrameParams {
    hostChannelId: string;
    pluginChannelId: string;
    // frameId: string;
    //
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
    // let hostNode = document.querySelector('[data-app-host]');
    if (!hostNode) {
        console.warn('No data-app-host');
        return null;
    }



    const params = hostNode.getAttribute('data-params');
    if (params === null) {
        console.warn('no data-params')
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
    authentication: Authentication;
    config: NiceConfig;
    channel: WindowChannel;
}

export interface SimpleError {
    message: string;
}
