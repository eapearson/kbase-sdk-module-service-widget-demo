
// For efficiency (much smaller payload!), the pdb infos are supplied as a 

import { MolstarFormat } from "../components/MolstarComponent";
// export type MolstarFormat = string;

// table.
// export type PDBInfoHeader = ['itemId', 'name', 'format', 'genomeRef', 'genomeName', 'fromRCSB', 'featureId', 'featureType', 'sequenceIdentities'];
export type PDBInfo = [string, string, string, string, string, boolean, string, string, string]
export type PDBInfos = Array<PDBInfo>

export interface PDBStructureInfo {
    itemId: string;
    structId: string;
    genomeName: string;
    genomeRef: string;
    featureId: string;
    featureType: string;
    chains: string;
    sequenceIdentities: string
    format: MolstarFormat;
    structureName: string;
    fromRCSB: boolean;
}
export type PDBSStructureInfo = Array<PDBStructureInfo>

export interface GetPDBStructureInfoResult {
    pdb_features: PDBInfos
}

export default class PDB {
    url: string;
    timeout: number;
    token: string | null;
    cache: Map<string, PDBSStructureInfo> = new Map();

    constructor({ url, token, timeout }: { url: string, token?: string | null, timeout: number }) {
        this.url = url;
        this.timeout = timeout
        this.token = token || null;
    }

    async fetchPDBInfo(ref: string): Promise<GetPDBStructureInfoResult> {
        const headers = new Headers();
        if (this.token) {
            headers.append('authorization', this.token);
        }

        // TODO: this will be a dynamic service, but it needs to be 
        // registered before we can even redire

        const refParam = ref.replace(/\//g, '_');

        const url = new URL(`${this.url}/rcsb-annotations/${refParam}`);

        const response = await fetch(url, { headers });

        return response.json() as unknown as GetPDBStructureInfoResult;
    }

    async getPDBStructureInfo(ref: string): Promise<PDBSStructureInfo> {
        const result = await this.fetchPDBInfo(ref);

        const pdbsInfos = result.pdb_features.map(([itemId, structureName, rawFormat, genomeRef, genomeName,
            from_rcsb, featureId, featureType, sequence_identities]) => {
            // TODO: something better...
            const format: MolstarFormat = rawFormat as unknown as MolstarFormat;
            return {
                itemId,
                structId: structureName, genomeName, genomeRef, featureId, featureType,
                chains: 'N/I',
                sequenceIdentities: sequence_identities || '',
                fromRCSB: from_rcsb || false,
                format,
                structureName
            };
        });

        return pdbsInfos;
    }
}