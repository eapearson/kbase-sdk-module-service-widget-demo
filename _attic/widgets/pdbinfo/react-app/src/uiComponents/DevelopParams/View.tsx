import { JSONObject, JSONValue, isJSONObject } from "@kbase/ui-lib/lib/json";
import { Component, PropsWithChildren } from "react";
import { Button, Container, Form } from "react-bootstrap";
import { FlexCol, FlexRow } from "../../components/FlexGrid";
import styles from './style.module.css';

export interface DevelopParamsProps extends PropsWithChildren {
    appParams: JSONObject
    widgetState: JSONObject
    updateAppParams: (appParams: JSONObject) => void;
    updateWidgetState: (widgetState: JSONObject) => void;
}

interface DevelopParamsState {
    appParamsText: string;
    appParams: JSONObject;
    widgetStateText: string;
    widgetState: JSONObject;
    isChanged: boolean;
    isValid: boolean;
}

function isEqual(v1: JSONValue, v2: JSONValue) {
    const t1 = typeof v1;
    const t2 = typeof v2
    if (t1 !== t2) {
        return false;
    }
    switch (t1) {
        case 'number':
        case 'string':
        case 'boolean':
        case 'undefined':
        case 'symbol':
            return v1 === v2;
        case 'object':
            if (v1 === null && v1 === null) {
                return true;
            }
            if (Array.isArray(v1)) {
                if (Array.isArray(v2)) {
                    if (v1.length !== v2.length) {
                        return false;
                    }
                    for (const i in v1) {
                        if (!isEqual(v1[i], v2[i])) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            }
            if (isJSONObject(v1)) {
                if (isJSONObject(v2)) {
                    const k1 = Object.keys(v1).sort();
                    const k2 = Object.keys(v2).sort();
                    if (k1.length !== k2.length) {
                        return false;
                    }
                    if (!isEqual(k1, k2)) {
                        return false;
                    }
                    for (const k of k1) {
                        if (!isEqual(v1[k], v2[k])) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            }
            return false;
        default: return false;
    }
}

export default class DevelopParams extends Component<DevelopParamsProps, DevelopParamsState>{
    constructor(props: DevelopParamsProps) {
        super(props);
        this.state = {
            appParamsText: JSON.stringify(props.appParams),
            appParams: props.appParams,
            widgetStateText: JSON.stringify(props.widgetState),
            widgetState: props.widgetState,
            isChanged: false,
            isValid: true
        }
    }

    componentDidUpdate(prevProps: Readonly<DevelopParamsProps>, prevState: Readonly<DevelopParamsState>, snapshot?: any): void {

        // Wow, react component updating is very tricky when there are multiple sources to reconcile!

        // Case 1. Internal state has changed
        if (!isEqual(this.state, prevState)) {
            const isChanged = !isEqual(this.state.appParams, this.props.appParams) || !isEqual(this.state.widgetState, this.props.widgetState);
            if (isChanged !== this.state.isChanged) {
                this.setState({ isChanged })
                return;
            }
        }

        if (!isEqual(this.props.appParams, prevProps.appParams) || !isEqual(this.props.widgetState, prevProps.widgetState)) {
            // console.log('props changed!')
            if (!isEqual(prevProps.widgetState, this.props.widgetState)) {
                this.setState({
                    widgetState: this.props.widgetState,
                    widgetStateText: JSON.stringify(this.props.widgetState),
                });
                // newState.widgetState = this.props.widgetState;
                console.log('not equal', prevProps.widgetState, this.props.widgetState);
            } else {
                console.log('equal', prevProps.widgetState, this.props.widgetState);
            }
        }


        // // Handle props having changed (from upstream context changes), which need to be reflected in the state and controls.
        // // This is trigerred when the new props are different than the old props AND ??
        // if (!isEqual(prevProps.widgetState, this.props.widgetState)) {
        //     // this.setState({
        //     //     widgetState: this.props.widgetState
        //     // });
        //     // newState.widgetState = this.props.widgetState;
        //     console.log('not equal', prevProps.widgetState, this.props.widgetState);
        // } else {
        //     console.log('equal', prevProps.widgetState, this.props.widgetState);
        // }

        // this.setState({
        //     ...this.state,
        //     ...newState
        // })
    }

    renderParamInput() {
        return <Container fluid>
            <FlexRow>
                <FlexCol>
                    <Form.Text>
                        Widget Params
                    </Form.Text>
                    <Form.Control
                        as="textarea"
                        rows={5}
                        value={this.state.appParamsText}
                        onChange={(ev) => {
                            const appParamsText = ev.currentTarget.value;
                            try {
                                const appParams = JSON.parse(appParamsText);
                                console.log('app params', appParams);
                                this.setState({
                                    appParamsText,
                                    appParams,
                                    isValid: true,
                                    isChanged: (appParamsText !== JSON.stringify(this.props.appParams))
                                });
                            } catch (ex) {
                                console.error('ERROR', ex);
                                this.setState({
                                    appParamsText,
                                    isValid: false,
                                    isChanged: (appParamsText !== JSON.stringify(this.props.appParams))
                                })
                            }
                        }}
                    />
                </FlexCol>
                <FlexCol>
                    <Form.Text>
                        Widget State
                    </Form.Text>
                    <Form.Control
                        as="textarea"
                        rows={5}
                        value={this.state.widgetStateText}
                        onChange={(ev) => {
                            const widgetStateText = ev.currentTarget.value;
                            try {
                                const widgetState = JSON.parse(widgetStateText);
                                this.setState({
                                    widgetStateText,
                                    widgetState,
                                    isValid: true,
                                    isChanged: (widgetStateText !== JSON.stringify(this.props.widgetState))
                                });
                            } catch (ex) {
                                this.setState({
                                    widgetStateText,
                                    isValid: false,
                                    isChanged: (widgetStateText !== JSON.stringify(this.props.widgetState))
                                })
                            }
                        }}
                    />
                </FlexCol>
            </FlexRow>
            <FlexRow style={{ justifyContent: 'center' }}>

                <Button
                    disabled={!this.state.isValid || !this.state.isChanged}
                    type="button"
                    onClick={() => {
                        this.props.updateAppParams(this.state.appParams);
                        this.props.updateWidgetState(this.state.widgetState)
                    }}>
                    Save {this.state.isValid ? '(valid)' : '(invalid)'} {this.state.isChanged ? '(changed)' : '(unchanged)'}
                </Button>

            </FlexRow>
        </Container>
    }

    render() {
        return <div className={styles.main}>
            <div className={styles.toolbarArea}>
                {this.renderParamInput()}
            </div>
        </div>
    }
}
