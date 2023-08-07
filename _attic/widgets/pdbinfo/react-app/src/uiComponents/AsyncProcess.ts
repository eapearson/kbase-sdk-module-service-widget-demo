export enum AsyncProcessStatus {
    NONE = 'NONE',
    INITIALIZING = 'INITIALIZING',
    ERROR = 'ERROR',
    SUCCESS = 'SUCCESS',
    UPDATING = 'UPDATING'
}

export interface AsyncProcessBase {
    status: AsyncProcessStatus;
}

export interface AsyncProcessNone extends AsyncProcessBase {
    status: AsyncProcessStatus.NONE;
}

export interface AsyncProcessInitializing extends AsyncProcessBase {
    status: AsyncProcessStatus.INITIALIZING;
}

export interface AsyncProcessError<E> extends AsyncProcessBase {
    status: AsyncProcessStatus.ERROR;
    error: E;
}

export interface AsyncProcessSuccess<T> extends AsyncProcessBase {
    status: AsyncProcessStatus.SUCCESS;
    value: T;
}

export interface AsyncProcessUpdating<T> extends AsyncProcessBase {
    status: AsyncProcessStatus.UPDATING;
    value: T;
}

export type AsyncProcess<T, E> =
    | AsyncProcessNone
    | AsyncProcessInitializing
    | AsyncProcessError<E>
    | AsyncProcessSuccess<T>
    | AsyncProcessUpdating<T>;
