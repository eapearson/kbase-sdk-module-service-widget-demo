// import { BaseStoreState } from '../../redux/store';
import { Component, PropsWithChildren } from 'react';
import Develop from './Develop';
// import { RootState } from '../../redux/root/store';
// import { startHostedEnvironment, startDevelopmentEnvironment } from '../../redux/root/actions';

// export interface OwnProps { }

// export enum RootState {
//     NONE = 0,
//     HOSTED,
//     DEVELOP,
//     ERROR
// }

// export interface RootStoreState {
//     root: {
//         hostChannelId: string | null;
//         channelId: string | null;
//         state: RootState;
//     };
// }

// interface StateProps {
//     rootState: RootState;
// }
// interface DispatchProps {
//     startHostedEnvironment: (params: IFrameParams) => void;
//     startDevelopmentEnvironment: () => void;
// }

// export function mapStateToProps(state: BaseStoreState, props: OwnProps): StateProps {
//     const {
//         root: { state: rootState }
//     } = state;

//     return {
//         rootState
//     };
// }

// export function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
//     return {
//         startHostedEnvironment: (params: IFrameParams) => {
//             dispatch(startHostedEnvironment(params) as any);
//         },
//         startDevelopmentEnvironment: () => {
//             dispatch(startDevelopmentEnvironment() as any);
//         }
//     };
// }

// export default connect<StateProps, DispatchProps, OwnProps, BaseStoreState>(
//     mapStateToProps,
//     mapDispatchToProps
// )(Root);

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