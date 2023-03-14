import React from "react";
import { AsyncProcess, AsyncProcessStatus } from "./AsyncProcess";
import { SimpleError, StartMessage } from "./widgetSupport";
import { WindowChannel } from "./windowChannel";


export interface NarrativeContextData {
    message: StartMessage;
    channel: WindowChannel;
}

export type NarrativeContextState = AsyncProcess<NarrativeContextData, SimpleError>

export const NarrativeContext = React.createContext<NarrativeContextState>({
    status: AsyncProcessStatus.NONE
})