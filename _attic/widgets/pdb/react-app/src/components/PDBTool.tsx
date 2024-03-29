import { Component } from "react";
import { Button, Col, Nav, Row, Tab } from "react-bootstrap";
import PDB, { PDBSStructureInfo, PDBStructureInfo } from "../lib/PDB";
import { AsyncProcess, AsyncProcessStatus } from "../uiComponents/AsyncProcess";
import ErrorAlert from "../uiComponents/ErrorAlert";
import Loading from "../uiComponents/Loading";
// import { NiceConfig } from "../uiComponents/narrativeTypes";
import { SimpleError } from "../uiComponents/widgetSupport";
// import NGLViewer from "./NGLViewer";
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { JSONObject } from '@kbase/ui-lib/lib/json';
import { NarrativeConfig } from "../uiComponents/Develop";
import { NarrativeContext, NarrativeContextState } from "../uiComponents/NarrativeContext";
import MolstarViewer from "./MolstarComponent";
import PDBBrowser from "./PDBBrowser";
import styles from './PDBTool.module.css';


export interface PDBToolProps {
    config: NarrativeConfig;
    // TODO: should also accept no auth
    token: string | null;
    // Params
    genomeRef: string;
    tabs?: Array<string>;
    selectedTab?: string | null;
    searchTerm: string | null;
    widgetStateUpdated: (widgetState: JSONObject) => void;
}

export interface TabInfo {
    id: string;
    label: string;
    pdbStructureInfo: PDBStructureInfo
}

export interface ToolState {
    pdbsStructureInfo: PDBSStructureInfo,
    tabs: Array<TabInfo>,
    activeTabKey: string;
}

export type ToolProcessState = AsyncProcess<ToolState, SimpleError>;

interface PDBToolState {
    processState: ToolProcessState;
}

export default class PDBTool extends Component<PDBToolProps, PDBToolState> {
    constructor(props: PDBToolProps) {
        super(props);
        this.state = {
            processState: {
                status: AsyncProcessStatus.NONE
            }
        }
    }

    async componentDidMount() {
        this.setState({
            processState: {
                status: AsyncProcessStatus.INITIALIZING
            }
        });
        try {
            // TODO: Need base url for when a service is not 
            // in the config, or in this case, ... oh, this is a
            // dynamic service, so we need to use the dynamic
            // service client... oh, well, TO DO!
            const url = `${document.location.origin}/services/servicewidgetdemo`
            const pdbClient = new PDB({ url, token: this.props.token, timeout: 1000 })
            const pdbsStructureInfo = await pdbClient.getPDBStructureInfo(this.props.genomeRef)

            // if we have tabs supplied in the props, we need to propopulate 
            // the tabs.
            const tabs = (() => {
                const propsTabs = this.props.tabs;
                if (propsTabs && propsTabs.length > 0) {
                    return pdbsStructureInfo.filter((pdb) => {
                        return propsTabs.includes(pdb.itemId);
                    }).map((pdb) => {
                        return {
                            id: pdb.itemId,
                            label: pdb.structId,
                            pdbStructureInfo: pdb
                        }
                    });
                }
                return [];
            })();

            const activeTabKey = this.props.selectedTab || 'browser';

            this.setState({
                processState: {
                    status: AsyncProcessStatus.SUCCESS,
                    value: {
                        pdbsStructureInfo,
                        activeTabKey,
                        tabs
                    }
                }
            })
        } catch (ex) {
            if (ex instanceof Error) {
                this.setState(({
                    processState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: ex.message
                        }
                    }
                }))
            } else {
                this.setState(({
                    processState: {
                        status: AsyncProcessStatus.ERROR,
                        error: {
                            message: 'Unknown error'
                        }
                    }
                }))
            }
        }
    }

    onShowMolstar(pdbStructureInfo: PDBStructureInfo) {
        const processState = this.state.processState
        if (processState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        if (processState.value.tabs.some(({ id, label }) => {
            return id === pdbStructureInfo.itemId;
        })) {
            // TODO: make the tab active.
            return;
        }


        this.setState({
            processState: {
                ...processState,
                value: {
                    ...processState.value,
                    tabs: processState.value.tabs.concat([{
                        id: pdbStructureInfo.itemId,
                        label: pdbStructureInfo.structId,
                        pdbStructureInfo
                    }]),
                    activeTabKey: pdbStructureInfo.itemId
                }
            }
        })
    }

    removeTabFromState(tabDef: TabInfo, selectedTab: string) {
        const processState = this.state.processState
        if (processState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        const tabs = processState.value.tabs
            .filter(({ id }) => {
                return id !== tabDef.id;
            })
            .map(({ id }) => {
                return id;
            });


        this.props.widgetStateUpdated({ widgetState: { tabs, selectedTab } });
    }

    closeTab(tabDef: TabInfo) {
        const processState = this.state.processState;
        if (processState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }

        const tabs = processState.value.tabs.filter((tabInfo) => {
            return (tabInfo.id !== tabDef.id)
        });
        const selectedTab = (() => {
            if (tabDef.id === processState.value.activeTabKey) {
                return 'browser';
            }
            return processState.value.activeTabKey
        })();
        this.setState({
            processState: {
                ...processState,
                value: {
                    ...processState.value,
                    tabs,
                    activeTabKey: selectedTab
                }
            }
        }, () => {
            this.removeTabFromState(tabDef, selectedTab)
        });
    }

    selectTabInContext(selectedTab: string) {
        const processState = this.state.processState
        if (processState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        const tabs = processState.value.tabs
            .map(({ id }) => {
                return id;
            });

        this.props.widgetStateUpdated({ widgetState: { tabs, selectedTab } });
    }

    onSelectTab(key: string | null) {
        if (key === null) {
            return;
        }
        const processState = this.state.processState;
        if (processState.status !== AsyncProcessStatus.SUCCESS) {
            return;
        }
        this.setState({
            processState: {
                ...processState,
                value: {
                    ...processState.value,
                    activeTabKey: key
                }
            }
        }, () => {
            this.selectTabInContext(key)
        });
    }

    // renderTabs(toolState: ToolState) {
    //     return toolState.tabs.map((tabDef) => {
    //         const { id, label } = tabDef;
    //         // const title = <span style={{paddingRight: '0.75em'}}>
    //         //     {label}{' '}
    //         //     <Button size="sm" variant="light" style={{ position: 'absolute', top: '0', right: '0', padding: '0.25em' }} onClick={(ev) => { ev.preventDefault(); this.closeTab(tabDef) }}>X</Button>
    //         // </span>
    //         // return <Tab eventKey={label} title={title} key={label} tabClassName={styles.molStarTab}>
    //         //     This is tab {label}. 
    //         // </Tab>
    //         return <Nav key={id} className={styles.molStarTab}>
    //             This is tab {label}. 
    //         </Nav>
    //     })
    // }

    renderTabNavs(toolState: ToolState) {
        return toolState.tabs.map((tabDef) => {
            const { id, label } = tabDef;
            return <Nav.Item style={{ display: 'flex', flexDirection: 'row' }} key={id}>
                <Nav.Link eventKey={id} style={{ flex: '1 1 0' }}>
                    {label}
                </Nav.Link>
                <Button
                    size="sm"
                    variant="light"
                    style={{ flex: '0 0 auto', padding: '0.25em' }}
                    onClick={(ev) => { ev.preventDefault(); this.closeTab(tabDef) }}>
                    <FontAwesomeIcon icon={faXmark} />
                </Button>
            </Nav.Item>
        })
    }

    renderTabContent(toolState: ToolState) {
        return toolState.tabs.map((tabDef) => {
            const { id } = tabDef;
            return <Tab.Pane className="flexScrollableColumn" eventKey={id} key={id}>
                {/* <NGLViewer structureName={tabDef.pdbStructureInfo.structureName} format={tabDef.pdbStructureInfo.format} /> */}
                <MolstarViewer structureName={tabDef.pdbStructureInfo.structureName} format={tabDef.pdbStructureInfo.format} />
            </Tab.Pane>
        })
    }

    renderTool2(toolState: ToolState) {
        return (
            <Tab.Container defaultActiveKey="browser" activeKey={toolState.activeTabKey} onSelect={this.onSelectTab.bind(this)}>
                <Row className="flexScrollable" style={{ flex: '1 1 0' }}>
                    <Col sm={2} className="flexScrollable">
                        <Nav variant="pills" className="flex-column flexScrollableColumn">
                            <Nav.Item>
                                <Nav.Link eventKey="browser">
                                    Browser
                                </Nav.Link>
                            </Nav.Item>
                            {this.renderTabNavs(toolState)}
                        </Nav>
                    </Col>
                    <Col sm={10} className="flexScrollableColumn" style={{ height: '100%' }}>
                        <Tab.Content className="flexScrollableColumn">
                            <Tab.Pane eventKey="browser" className="flexScrollableColumn">
                                {/* TODO: haha - don't need this here as widgetStateUpdated is passed in as a prop too  */}
                                <NarrativeContext.Consumer>
                                    {(state: NarrativeContextState) => {
                                        console.log('HERE??', state);
                                        if (state.status !== AsyncProcessStatus.SUCCESS) {
                                            return;
                                        }
                                        const onShowMolstar = (pdbStructureInfo: PDBStructureInfo) => {
                                            const processState = this.state.processState
                                            if (processState.status !== AsyncProcessStatus.SUCCESS) {
                                                return;
                                            }
                                            // console.log('showing molstar tab...', pdbStructureInfo.structId, pdbStructureInfo);
                                            if (processState.value.tabs.some(({ id, label }) => {
                                                return id === pdbStructureInfo.itemId;
                                            })) {
                                                // TODO: make the tab active.
                                                return;
                                            }
                                            const tabs = processState.value.tabs.map(({ id }) => {
                                                return id;
                                            });
                                            tabs.push(pdbStructureInfo.itemId);
                                            state.value.widgetStateUpdated({
                                                widgetState: {
                                                    tabs, selectedTab: pdbStructureInfo.itemId
                                                }
                                            });
                                            this.onShowMolstar(pdbStructureInfo);
                                        }
                                        return <PDBBrowser
                                            pdbsStructureInfo={toolState.pdbsStructureInfo}
                                            onShowMolstar={onShowMolstar}
                                            searchTerm={this.props.searchTerm}
                                            selected={toolState.tabs.map(({ id }) => { return id; })}

                                        />
                                    }}
                                </NarrativeContext.Consumer>

                            </Tab.Pane>
                            {this.renderTabContent(toolState)}
                        </Tab.Content>

                    </Col>
                </Row>
            </Tab.Container>
        )
    }

    // renderTool(toolState: ToolState) {
    //     return <Tabs defaultActiveKey="browser" activeKey={toolState.activeTabKey} onSelect={this.onSelectTab.bind(this)}>
    //         <Tab eventKey="browser" title="Browser">
    //         <PDBBrowser pdbsStructureInfo={toolState.pdbsStructureInfo} onShowMolstar={this.onShowMolstar.bind(this)}  selected={toolState.tabs.map(({ label }) => { return label; })}/>
    //         </Tab>
    //         {this.renderTabs(toolState)}
    //     </Tabs>
    // }

    renderState() {
        const processState = this.state.processState;
        switch (processState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.INITIALIZING:
                return <Loading message="Loading PDBs..." />
            case AsyncProcessStatus.ERROR:
                return <ErrorAlert message={processState.error.message} />
            case AsyncProcessStatus.SUCCESS:
                return this.renderTool2(processState.value);
            case AsyncProcessStatus.UPDATING:
        }
    }
    render() {
        return <div className={styles.main + ' flexScrollableColumn'}>
            {/* <p>Welcome to the PDB Tool</p> */}
            {this.renderState()}
        </div>
    }
}