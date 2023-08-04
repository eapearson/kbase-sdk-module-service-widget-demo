import { Component, PropsWithChildren } from "react";
import DevelopAuth from "../DevelopAuth";
import DevelopParams from "../DevelopParams";
import FakeIFrame from "../FakeIFrame";
import styles from './style.module.css';

export interface ViewProps extends PropsWithChildren {
    // narrativeConfig: NarrativeConfig
}

interface ViewState { }

export default class View extends Component<ViewProps, ViewState> {
    render() {
        return <div className={styles.main + ' flexScrollableColumn'}>
            <h1>PDB Widget Demo Developer Tool</h1>
            <div className={styles.paramsArea}>
                <DevelopParams />
            </div>
            <div className={styles.authArea}>
                <DevelopAuth />
            </div>
            <div className={styles.iframeArea}>
                <FakeIFrame>
                    {this.props.children}
                </FakeIFrame>
            </div>
        </div>
    }
}
