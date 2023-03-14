import { AsyncProcess, AsyncProcessStatus, Workspace } from '@kbase/ui-lib';
import { StatusDependency, StatusResult } from '@kbase/ui-lib/lib/comm/coreServices/Workspace';
import { Component } from 'react';
import { Alert, Table } from 'react-bootstrap';
import { StartMessage } from '../App';
import Loading from './Loading';
import RotatedTable, { RotatedTableRow } from './RotatedTable';

// function serviceEndpoint() {
//     const origin = document.location.origin;
//     if (origin.startsWith('https://narrative.kbase.us')) {
//         return 'https://kbase.use/services/';
//     } else {
//         return `${origin}/services/`;
//     }
// }

export interface WSInfoProps {
    message: StartMessage;
}

export interface WorkspaceInfo {
    wsStatus: StatusResult;
}

export interface SimpleError {
    message: string;
}

interface WSInfoState {
    process: AsyncProcess<WorkspaceInfo, SimpleError>;
}

export default class WSInfo extends Component<WSInfoProps, WSInfoState> {
    constructor(props: WSInfoProps) {
        super(props);
        this.state = {
            process: {
                status: AsyncProcessStatus.NONE,
            },
        };
    }

    async loadData() {
        this.setState({
            process: {
                status: AsyncProcessStatus.PENDING,
            },
        });
        try {
            const workspace = new Workspace({
                url: this.props.message.config.services.workspace,
                timeout: this.props.message.config.comm_wait_timeout,
            });
            const wsStatus = await workspace.status();
            this.setState({
                process: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        wsStatus,
                    },
                },
            });
        } catch (ex) {
            if (ex instanceof Error) {
                this.setState({
                    process: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message,
                        },
                    },
                });
            } else {
                this.setState({
                    process: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: 'Unknown Error',
                        },
                    },
                });
            }
        }
    }

    componentDidMount() {
        this.loadData();
    }

    renderError(error: SimpleError) {
        return <Alert variant="error">{error.message}</Alert>;
    }

    renderDependencies(dependencies: Array<StatusDependency>) {
        const rows = dependencies.map(({ name, state, message, version }) => {
            return (
                <tr>
                    <td>{name}</td>
                    <td>{state}</td>
                    <td>{message}</td>
                    <td>{version}</td>
                </tr>
            );
        });
        return (
            <Table bordered striped>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>State</th>
                        <th>Message</th>
                        <th>Version</th>
                    </tr>
                </thead>
                <tbody>{rows}</tbody>
            </Table>
        );
    }
    renderUserInfo(value: WorkspaceInfo) {
        const rows: Array<RotatedTableRow> = [
            // ['Token', this.props.message.auth.token],
            ['Username', this.props.message.auth.accountInfo.user],
            ['Your Name', this.props.message.auth.accountInfo.display],
        ];
        return <RotatedTable rows={rows} styles={{ col1: { flex: '0 0 8em' } }} />;
    }

    renderWorkspaceStatus(value: WorkspaceInfo) {
        const { state, version, git_url, message, freemem, maxmem, totalmem, dependencies } =
            value.wsStatus;
        const rows: Array<RotatedTableRow> = [
            ['State', state],
            ['Version', version],
            ['Git URL', git_url],
            // ['Published', Intl.DateTimeFormat('en-US', {}).format(staticNarrativeSavedAt)],
            ['Message', message],
            [
                'Free Memory',
                () => {
                    return (
                        <div
                            style={{
                                flex: '0 0 18em',
                                textAlign: 'right',
                                paddingRight: '9em',
                                fontFamily: 'monospace',
                            }}
                        >
                            {Intl.NumberFormat('en-US', { useGrouping: true }).format(freemem)}
                        </div>
                    );
                },
            ],
            [
                'Max Memory',
                () => {
                    return (
                        <div
                            style={{
                                flex: '0 0 18em',
                                textAlign: 'right',
                                paddingRight: '9em',
                                fontFamily: 'monospace',
                            }}
                        >
                            {Intl.NumberFormat('en-US', { useGrouping: true }).format(maxmem)}
                        </div>
                    );
                },
            ],
            [
                'Total Memory',
                () => {
                    return (
                        <div
                            style={{
                                flex: '0 0 18em',
                                textAlign: 'right',
                                paddingRight: '9em',
                                fontFamily: 'monospace',
                            }}
                        >
                            {Intl.NumberFormat('en-US', { useGrouping: true }).format(totalmem)}
                        </div>
                    );
                },
            ],
            ['Dependencies', this.renderDependencies(dependencies)],
        ];
        return <RotatedTable rows={rows} styles={{ col1: { flex: '0 0 8em' } }} />;
    }

    renderSuccess2(value: WorkspaceInfo) {
        return (
            <div>
                <h4>User Account Info</h4>
                {this.renderUserInfo(value)}
                <h4>Workspace Status</h4>
                {this.renderWorkspaceStatus(value)}
            </div>
        );
    }

    render() {
        switch (this.state.process.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return <Loading message="Loading..." />;
            case AsyncProcessStatus.ERROR:
                return this.renderError(this.state.process.error);
            case AsyncProcessStatus.SUCCESS:
                return this.renderSuccess2(this.state.process.value);
        }
    }
}
