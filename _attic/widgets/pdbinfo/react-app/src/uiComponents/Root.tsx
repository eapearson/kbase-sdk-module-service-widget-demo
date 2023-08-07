import { Component, PropsWithChildren } from 'react';
import Develop from './Develop';

function isIFramed(): boolean {
    if (window.frameElement) {
        return true;
    }
    return false;
}

export interface ControllerProps extends PropsWithChildren {

}

interface ControllerState {
    isIFramed: boolean;
}

export default class Controller extends Component<ControllerProps, ControllerState> {
    constructor(props: ControllerProps) {
        super(props);
        this.state = {
            isIFramed: isIFramed()
        }
    }

    render() {
        if (this.state.isIFramed) {
            return this.props.children;
        }
        return <Develop>
            {this.props.children}
        </Develop>
    }
}