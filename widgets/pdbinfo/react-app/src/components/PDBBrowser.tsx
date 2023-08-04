import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Component } from "react";
import { Button, FormControl, InputGroup } from "react-bootstrap";
import DataBrowser, { Columns } from "./DataBrowser";
import { FlexCol, FlexRow } from "./FlexGrid";
import {PDBInfo} from "../lib/PDBReport";

function niceCount(count: number) {
    return Intl.NumberFormat('en-US', { useGrouping: true }).format(count);
}

export interface PDBBrowserProps {
    pdbInfos: Array<PDBInfo>;
    onShowMolstar: (pdbInfo: PDBInfo) => void;
    selected: Array<string>;
    searchTerm: string | null;
}

interface PDBBrowserState {
    searchValue: string;
    pdbs: Array<PDBInfo>;
}

export default class PDBBrowser extends Component<PDBBrowserProps, PDBBrowserState> {
    constructor(props: PDBBrowserProps) {
        super(props);
        this.state = {
            searchValue: this.props.searchTerm || '',
            pdbs: props.pdbInfos
        }
    }
    addPDBTab(info: PDBInfo, index: number) {

    }

    onSearch(searchValue: string) {
        if (searchValue === '') {
            this.setState({
                searchValue,
                pdbs: this.props.pdbInfos
            })
        }
        const searchRegex = new RegExp(searchValue, 'i');
        this.setState({
            searchValue,
            pdbs: this.props.pdbInfos.filter(({ structureName, genomeRef, featureId }) => {
                return (
                    searchRegex.test(structureName) ||
                    searchRegex.test(genomeRef) ||
                    searchRegex.test(featureId)
                )
            })
        })
    }

    clearSearch() {
        this.setState({
            searchValue: '',
            pdbs: this.props.pdbInfos
        })
    }

    // renderx() {
    //     const rows = this.props.pdbsStructureInfo.map((pdbStructureinfo, index) => {
    //         const { itemId, structId, fromRCSB, genomeRef, featureId, chains, sequenceIdentities } = pdbStructureinfo;
    //         const rcsbLink = (() => {
    //             if (fromRCSB) {
    //                 return <a href={`https://www.rcsb.org/structure/${structId}`} target="_blank" rel="noreferrer">
    //                     RCSB
    //                 </a>
    //             } 
    //             return 'n/a';
    //         })();
    //         //  addPDBTab(pdbStructureInfo[index], index);
    //         const molStarVariant = (() => {
    //             if (this.props.selected.includes(itemId)) {
    //                 return "secondary";
    //             }
    //             return "outline-secondary";
    //         })();
    //         return <tr key={itemId}>
    //             <td>
    //                 {structId}
    //             </td>
    //             <td>
    //                 <Button variant={molStarVariant} style={{marginRight: '0.25em'}}
    //                     onClick={(ev) => {
    //                     ev.preventDefault();
    //                     this.props.onShowMolstar(pdbStructureinfo)
    //                 }}>
    //                     mol*
    //                 </Button>
    //             </td>
    //             <td>
    //                 {rcsbLink}
    //             </td>
    //             <td>
    //                 <a href={`${document.location.origin}/#dataview/${genomeRef}`} target="_blank" rel="noreferrer">
    //                     {genomeRef}
    //                 </a>
    //             </td>
    //             <td>
    //                 <a href={`${document.location.origin}/#dataview/${genomeRef}?sub=Feature&subid=${featureId}`} target="_blank" rel="noreferrer">
    //                     {featureId}
    //                 </a>
    //             </td>
    //             <td>{chains}</td>
    //             <td>{sequenceIdentities}</td>
    //         </tr> 
    //     });

    //     /*
    //       $row.append($el('td').text(pdb.chains));
    //             $row.append($el('td').text(pdb.sequenceIdentities));
    //     */

    //     // TODO: probably transform to something nicer...
    //     return <div className="flexScrollingColumn">
    //         <Table>
    //             <thead>
    //                 <tr>
    //                     <th>
    //                         Id
    //                     </th>
    //                     <th colSpan={2} style={{ textAlign: 'center' }}>
    //                         Viewers
    //                     </th>
    //                     <th>Genome</th>
    //                     <th>Feature</th>
    //                     <th>Model and chain matching feature</th>
    //                     <th>Sequence identity</th>
    //                 </tr>
    //             </thead>
    //             <tbody>
    //                 {rows}
    //             </tbody>
    //         </Table>
    //     </div>;
    // }

    render() {
        const columns: Columns<PDBInfo> = [
            {
                id: 'structId',
                label: 'ID',
                render: (pdb: PDBInfo) => {
                    return pdb.structureName
                },
                flex: '0 0 6em',
                sorter: (a: PDBInfo, b: PDBInfo) => {
                    return a.structureName.localeCompare(b.structureName);
                }
            },
            {
                id: 'format',
                label: 'Format',
                render: (pdb: PDBInfo) => {
                    return pdb.format
                },
                flex: '0 0 6em',
                sorter: (a: PDBInfo, b: PDBInfo) => {
                    return a.format.localeCompare(b.format);
                }
            },
            {
                id: 'viewers',
                label: 'Viewers',
                render: (pdb: PDBInfo) => {
                    const rcsbLink = (() => {
                        if (pdb.fromRCSB) {
                            return <a href={`https://www.rcsb.org/structure/${pdb.structureName}`} target="_blank" rel="noreferrer">
                                RCSB
                            </a>
                        }
                        return 'n/a';
                    })();
                    //  addPDBTab(pdbStructureInfo[index], index);
                    const molStarVariant = (() => {
                        if (this.props.selected.includes(pdb.itemId)) {
                            return "secondary";
                        }
                        return "outline-secondary";
                    })();
                    return <span>
                        <Button variant={molStarVariant} style={{ marginRight: '0.25em' }}
                            onClick={(ev) => {
                                ev.preventDefault();
                                this.props.onShowMolstar(pdb)
                            }}>
                            mol*
                        </Button>

                        {rcsbLink}
                    </span>
                },
                flex: '0 0 10em',
            },
            {
                id: 'genome',
                label: 'Genome',
                render: ({ genomeRef }: PDBInfo) => {
                    return <a href={`${document.location.origin}/#dataview/${genomeRef}`} target="_blank" rel="noreferrer">
                        {genomeRef}
                    </a>
                },
                flex: '0 0 7em',
                sorter: (a: PDBInfo, b: PDBInfo) => {
                    return a.genomeRef.localeCompare(b.genomeRef);
                }
            },
            {
                id: 'feature',
                label: 'Feature',
                render: ({ genomeRef, featureId }: PDBInfo) => {
                    return <a href={`${document.location.origin}/#dataview/${genomeRef}?sub=Feature&subid=${featureId}`} target="_blank" rel="noreferrer">
                        {featureId}
                    </a>
                },
                flex: '0 0 10em',
                sorter: (a: PDBInfo, b: PDBInfo) => {
                    return a.featureId.localeCompare(b.featureId);
                }
            },
            {
                id: 'chain',
                label: 'Model and Chain Matching Feature',
                render: (pdb: PDBInfo) => {
                    return pdb.chainIds
                },
                // sorter: (a: PDBInfo, b: PDBInfo) => {
                //     return a.chainIds.localeCompare(b.chainIds);
                // }
            },
            {
                id: 'sequenceIdentity',
                label: 'Sequence Identity',
                render: (pdb: PDBInfo) => {
                    return pdb.sequenceIdentities
                },
                // sorter: (a: PDBInfo, b: PDBInfo) => {
                //     return a.sequenceIdentities.localeCompare(b.sequenceIdentities);
                // }
            },
        ]

        return <FlexCol>
            <FlexCol style={{ flex: '0 0 auto' }}>
                <FlexRow style={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                    {/* <FlexCol title style={{flex: '0 0 auto'}}>
                        Search
                    </FlexCol> */}
                    <FlexCol style={{ flex: '0 0 auto' }}>
                        <InputGroup>
                            <FormControl
                                placeholder="Search table"
                                value={this.state.searchValue}
                                onChange={(ev) => { this.onSearch(ev.currentTarget.value) }} />
                            <Button variant="outline-secondary" onClick={this.clearSearch.bind(this)}><FontAwesomeIcon icon={faTimes} /></Button>
                        </InputGroup>
                    </FlexCol>
                    <FlexCol>
                        {this.renderCount()}
                    </FlexCol>
                </FlexRow>
            </FlexCol>
            <FlexCol>
                <DataBrowser columns={columns} dataSource={this.state.pdbs} heights={{ header: 40, row: 60 }} />
            </FlexCol>
        </FlexCol>
    }



    renderCount() {
        if (this.state.pdbs.length === this.props.pdbInfos.length) {
            if (this.state.searchValue !== '') {
                return <span>All {niceCount(this.state.pdbs.length)} records match for <i>{this.state.searchValue}</i>.</span>
            }
            return <span>{niceCount(this.state.pdbs.length)} records</span>
        }
        if (this.state.pdbs.length === 0) {
            return <span>Nothing found for <i>{this.state.searchValue}</i></span>
        }
        return <span>Found {niceCount(this.state.pdbs.length)} out of {niceCount(this.props.pdbInfos.length)} for <i>{this.state.searchValue}</i>.</span>
    }
}