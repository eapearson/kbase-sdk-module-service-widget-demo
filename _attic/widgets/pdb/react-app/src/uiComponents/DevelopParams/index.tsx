import { Component } from "react";
import { ContextStatus, DevelopContext } from '../Develop';
import DevelopParams from './View';

export default class Controller extends Component {
    render() {
        return <DevelopContext.Consumer>
            {(contextValue) => {
                if (contextValue.status !== ContextStatus.READY) {
                    return;
                }
                const { appParams, widgetState, updateAppParams, updateWidgetState } = contextValue.value;

                return <DevelopParams
                    {...this.props}
                    appParams={appParams!}
                    widgetState={widgetState!}
                    updateAppParams={updateAppParams}
                    updateWidgetState={updateWidgetState}
                />
            }}
        </DevelopContext.Consumer>
    }
}
