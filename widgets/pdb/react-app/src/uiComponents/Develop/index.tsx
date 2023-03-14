import { Component, PropsWithChildren } from "react";
import { DevelopAuthState } from "../DevelopAuth";
import View from "./View";


// Okay, this is not pretty, but the narrative config is a bit message too.
export interface ServicesConfig {
                auth: string,
                // awe: string,
                catalog: string,
                // data_import_export: string,
                execution_engine2: string,
                // fba: string,
                // genomeCmp: string,
                groups: string,
                // job_service: string,
                // narrative_job_proxy: string,
                narrative_method_store: string,
                narrative_method_store_image: string,
                sample_service: string,
                // search: string,
                searchapi2: string,
                service_wizard: string,
                // shock: string,
                // transform: string,
                // trees: string,
                // user_and_job_state: string,
                user_profile: string,
                workspace: string,
};
export interface NarrativeConfig {
    services: ServicesConfig,
    auth_cookie: string,
    comm_wait_timeout: number,
    environment: string,
    dev_mode: boolean,
    git_commit_hash: string,
    git_commit_time: number,
    version:string
}


function devConfig(origin: string): NarrativeConfig {
    function serviceURL(servicePath: string): string {
        return `${origin}/services/${servicePath}`
    }
    return {
        services: {
            auth: serviceURL('auth'),
            catalog: serviceURL('catalog'),
            execution_engine2: serviceURL('ee2'),
            groups: serviceURL('groups'),
            narrative_method_store: serviceURL('ee2/rpc'),
            narrative_method_store_image: serviceURL('ee2/img'),
            sample_service: serviceURL('samples'),
            searchapi2: serviceURL('search2'),
            service_wizard: serviceURL('service_wizard'),
            user_profile: serviceURL('user_profile'),
            workspace: serviceURL('ws'),
        },
        auth_cookie: 'kbase_session',
        comm_wait_timeout: 1000,
        environment: 'ci',
        dev_mode: true,
        git_commit_hash: 'foo',
        git_commit_time: 0,
        version: '0.0.0'
    }
}


export interface ControllerProps extends PropsWithChildren{ }

interface ControllerState {
    authState: DevelopAuthState
 }

export default class Controller extends Component<ControllerProps, ControllerState> {
    render() {
        
        return <View narrativeConfig={devConfig(document.location.origin)}>{this.props.children}</View>
    }
}