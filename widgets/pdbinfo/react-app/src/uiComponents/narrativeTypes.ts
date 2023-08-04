export interface NarrativeEnvConfig {
    auth: string,
    awe: string,
    catalog: string,
    cdn: string,
    compound_img_url: string,
    data_import_export: string,
    data_panel_sources: string,
    execution_engine2: string,
    fba: string,
    ftp_api_root: string,
    ftp_api_url: string,
    gene_families: string,
    genomeCmp: string,
    groups: string,
    job_service: string,
    landing_pages: string,
    log_host: string,
    log_port: number,
    log_proxy_host: string,
    log_proxy_port: number,
    login: string,
    narrative_job_proxy: string,
    narrative_method_store: string,
    narrative_method_store_image: string,
    narrative_method_store_types: string,
    profile_page: string,
    protein_info: string,
    provenance_view: string,
    reset_password: string,
    sample_service: string,
    search: string,
    searchapi2: string,
    service_wizard: string,
    shock: string,
    staging_api_url: string,
    static_narrative_root: string,
    status_page: string,
    submit_jira_ticket: string,
    transform: string,
    trees: string,
    ui_common_root: string,
    update_profile: string,
    uploader: string,
    user_and_job_state: string,
    user_profile: string,
    version_check: string,
    workspace: string,
    ws_browser: string,
    google_analytics_id: string
}

export interface DataPanelConfig {
    // TODO
}

export interface TooltipConfig {
    // TODO
}

export interface UploadConfig {
    // TODO
}

export interface NarrativeConfigFull {
    ci: NarrativeEnvConfig;
    appdev: NarrativeEnvConfig;
    dev: NarrativeEnvConfig;
    next: NarrativeEnvConfig;
    prod: NarrativeEnvConfig;
    'narrative-dev': NarrativeEnvConfig;
    'narrative-refactor': NarrativeEnvConfig;


    auth_cookie: string;
    auth_sleep_recheck_ms: number;
    comm_wait_timeout: number;
    config: string;
    data_panel: DataPanelConfig;
    dev_mode: boolean;
    git_commit_hash: string;
    git_commit_time: string;
    loading_gif: string;
    name: string;
    release_notes: string;
    tooltip: TooltipConfig;
    upload: UploadConfig;
    uses_local_widgets: true;
    version: string;
}


export interface NarrativeConfigEnv {
    env: NarrativeEnvConfig;

    auth_cookie: string;
    auth_sleep_recheck_ms: number;
    comm_wait_timeout: number;
    config: string;
    data_panel: DataPanelConfig;
    dev_mode: boolean;
    git_commit_hash: string;
    git_commit_time: string;
    loading_gif: string;
    name: string;
    release_notes: string;
    tooltip: TooltipConfig;
    upload: UploadConfig;
    uses_local_widgets: true;
    version: string;
}

// A bit rough. Pluck out and reorganize config fields for consumption
// by widgets.
// TODO: redo this with nicer and consistent property names.
export interface ServiceConfig {
    url: string;
}
export interface NiceConfig {
    services: {
        auth: ServiceConfig
        catalog: ServiceConfig,
        // data_import_export: string,
        execution_engine2: ServiceConfig
        fba: ServiceConfig
        // genomeCmp: string,
        groups: ServiceConfig;
        // job_service: string,
        // narrative_job_proxy: string,
        // narrative_method_store: string,
        narrative_method_store_image: string,
        sample_service: string,
        search: string,
        searchapi2: string,
        service_wizard: string,
        shock: string,
        transform: string,
        trees: string,
        user_and_job_state: string,
        user_profile: string,
        workspace: string,
    },
    authCookieName: string;
    connectionTimeout: number;
    deaployEnvironmentName: string;
    isDevelopMode: boolean;
    gitCommitHash: string;
    gitCommitTime: string;
    version: string;
}

export interface Role {
    id: string;
    desc: string;
}

export interface Ident {
    provusername: string;
    provider: string;
    id: string;
}

export interface PolicyId {
    id: string;
    agreedon: number;
}

export interface TokenInfo {
    cachefor: number;
    created: number;
    expires: number;
    id: string;
    name: string | null;
    type: string;
    user: string;
    // custom: 
}


export interface AccountInfo {
    created: number;
    display: string;
    email: string;
    lastlogin: number;
    local: boolean;
    user: string;
    roles: Array<Role>;
    policyids: Array<PolicyId>;
    customroles: Array<string>;
    idents: Array<Ident>;
}

export interface Authentication {
    realname: string;
    username: string;
    token: string;
    roles: Array<string>
}