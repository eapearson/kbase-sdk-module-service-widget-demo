import { Component, createRef, RefObject } from "react";
// import { DefaultPluginSpec } from "molstar/lib/mol-plugin/spec";
// import { DefaultPluginUISpec } from "molstar/lib/mol-plugin-ui/spec";
import { createPluginUI } from "molstar/lib/mol-plugin-ui/index";
// import { PluginContext } from "molstar/lib/mol-plugin/context";
import "molstar/build/viewer/molstar.css";

import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
// import "molstar/lib/mol-plugin-ui/skin/light.scss";
// import "molstar/lib/mol-plugin-ui/skin/";

// import { ParamDefinition } from "molstar/lib/mol-util/param-definition";
// import { CameraHelperParams } from "molstar/lib/mol-canvas3d/helper/camera-helper";
export type MolstarFormat = "mmcif" | "cifCore" | "pdb" | "pdbqt" | "gro" | "xyz" | "mol" | "sdf" | "mol2" ;


export interface MolstarComponentProps {
    useInterface?: boolean;
    structureName?: string;
    format: MolstarFormat
    // url?: string;
    // showControls?: boolean;
    // showAxes?: boolean;

}

interface MolstarComponentState {
    useInterface: boolean;
}

export default class MolstarComponent extends Component<MolstarComponentProps, MolstarComponentState> {
    parentRef: RefObject<HTMLDivElement>;
    canvasRef: RefObject<HTMLCanvasElement>;
    plugin: PluginUIContext | null = null;
    constructor(props: MolstarComponentProps) {
        super(props);
        this.parentRef = createRef();
        this.canvasRef = createRef();
    }

    componentDidMount() {
      
        this.initialize();
    }

    async initialize() {
        if (this.parentRef.current === null) {
            return;
        }
        this.plugin = await createPluginUI(this.parentRef.current)
        this.loadStructure();
    }

    async loadStructure () {
        if (!this.plugin) {
            return;
        }
        this.plugin.clear();
        const url = `https://files.rcsb.org/download/${this.props.structureName}.${this.props.format}`;
        const data = await this.plugin.builders.data.download(
            { url }, {state: {isGhost: true}}
        );
        const trajectory = await this.plugin.builders.structure.parseTrajectory(data, this.props.format);
        return this.plugin.builders.structure.hierarchy.applyPreset(trajectory, "default");
    }

    render() {
        const width = '100%';
        const height = '100%';

        if (this.props.useInterface) {
            return (
            <div style={{position: "absolute", width, height, overflow: "hidden"}}>
                <div ref={this.parentRef} style={{position: "absolute", left: 0, top: 0, right: 0, bottom: 0}} />
            </div>
            )
        }

        return (
            <div
            ref={this.parentRef}
            style={{position: "relative", width, height}}
            >
            <canvas
                ref={this.canvasRef}
                style={{position: "absolute", top: 0, left: 0, right: 0, bottom: 0}}
            />
            </div>
        );
    }
}