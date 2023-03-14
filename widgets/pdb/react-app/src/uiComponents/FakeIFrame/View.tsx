import { Component, PropsWithChildren } from "react";
import styles from './style.module.css';

export interface ViewProps extends PropsWithChildren{
    hostChannelId: string;
    appChannelId: string;
    height: number | null;
    hasLoaded: () => void;
}

export default class View extends Component<ViewProps> {
    componentDidMount() {
        this.props.hasLoaded();
    }
    renderFakeIFrame() {
        const { hostChannelId, appChannelId } = this.props;
        const params = encodeURIComponent(JSON.stringify({
            hostChannelId, appChannelId
        }));
        const heightStyle = this.props.height ? `${this.props.height}px` : `auto`;
        return <div data-params={params} data-app-host className={styles.main + ' flexScrollableColumn'} style={{height: heightStyle}}>
            {this.props.children}
        </div>
    }

    render() {
        return <div className={styles.iframeArea} style={{height: `${this.props.height || 100}px` }}>
            {this.renderFakeIFrame()}
        </div>
    }
}