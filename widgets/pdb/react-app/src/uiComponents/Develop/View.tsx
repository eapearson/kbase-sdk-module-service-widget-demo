import { Component, PropsWithChildren } from "react";
import { NarrativeConfig } from ".";
import DevelopAuth from "../DevelopAuth";
import styles from './style.module.css';

export interface ViewProps extends PropsWithChildren {
    narrativeConfig: NarrativeConfig
 }

interface ViewState { }

export default class View extends Component<ViewProps, ViewState> {
    // renderFakeIFrame() {
    //     switch (this.props.authState) {
    //         case DevelopAuthStatus.
    //     }
    //     return <div></div>
    // }
    render() {
        
        return <div className={styles.main + ' flexScrollableColumn'}>
            <div>Title here</div>
            <div className={styles.authArea + ' flexScrollableColumn'}>
                <DevelopAuth narrativeConfig={this.props.narrativeConfig} >
                    {this.props.children}
                </DevelopAuth>
            </div>
        </div>
    }
}