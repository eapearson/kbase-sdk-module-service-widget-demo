import * as NGL from 'ngl';
import { Component, createRef, RefObject } from "react";

export interface NGLViewerProps {

    structureName?: string;
    format: string;
}

interface NGLViewerState {

}

export default class NGLViewer extends Component<NGLViewerProps, NGLViewerState> {
    viewer: RefObject<HTMLDivElement>;

    constructor(props: NGLViewerProps) {
        super(props);
        this.viewer = createRef();
    }

    componentDidMount() {
        this.initialize();
    }

    async initialize() {
        if (this.viewer.current === null) {
            return;
        }
        const stage = new NGL.Stage(this.viewer.current, {backgroundColor: 'gray'});
        const url = `https://files.rcsb.org/download/${this.props.structureName}.${this.props.format}`;
        const component = await stage.loadFile(url, {
            ext: this.props.format,
            defaultRepresentation: true,
        });

        if (!component) {
            return;
        }
        component.autoView();
    }

    render() {
        return <div ref={this.viewer} style={{ height: '100%' }} />
    }
}