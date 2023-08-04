import {DynamicServiceClient} from "@kbase/ui-lib";
import {JSONObject} from "@kbase/ui-lib/lib/json";
import {MolstarFormat} from "../components/MolstarComponent";

export interface PDBInfoRaw extends JSONObject {
    chain_ids: string
    exact_matches: string
    feature_id: string
    feature_type: FeatureType
    file_extension: string
    file_path: string
    from_rcsb: number
    genome_name: string
    genome_ref: string
    is_model: number
    narrative_id: number
    model_ids: string
    scratch_path: string
    sequence_identities: string
    structure_name: string
}

export type FeatureType = "gene"

export interface PDBInfo {
    itemId: string
    chainIds: Array<string>
    exactMatches: Array<string>
    featureId: string
    featureType: FeatureType
    fileExtension: string
    format: MolstarFormat
    filePath: string
    fromRCSB: boolean
    genomeName: string
    genomeRef: string
    isModel: boolean
    narrativeId: number
    sequenceIdentities: Array<string>
    structureName: string
}

export interface GetPDBInfosParams extends JSONObject {
    protein_structures_ref: string;
}

export type GetPDBInfosResult =  Array<PDBInfoRaw>

export class PDBInfoClient extends DynamicServiceClient {
    module:string = 'PDBHTMLReport'

    async getPDBInfos(ref: string): Promise<GetPDBInfosResult> {
        const [result] = await this.callFunc<[GetPDBInfosParams], [GetPDBInfosResult]>('get_PDBInfos', [
            {protein_structures_ref: ref}
        ]);
        return result;
    }

    //   async rename_narrative(params: RenameNarrativeParams): Promise<RenameNarrativeResult> {
    //     const [result] = await this.callFunc<[RenameNarrativeParams], [RenameNarrativeResult]>('rename_narrative', [
    //         params
    //     ]);
    //     return result;
    // }
}

export interface PDBReportCParams {
    url: string;
    token: string;
    timeout: number;
}

export default class PDBReport {
    url: string;
    timeout: number;
    token: string;
    constructor({url, token, timeout}: PDBReportCParams) {
        this.url = url;
        this.timeout = timeout;
        this.token = token;
    }

    async getPDBInfos(ref: string): Promise<Array<PDBInfo>> {
        const client = new PDBInfoClient({
            url: this.url,
            token: this.token,
            timeout: this.timeout
        })
        const infosRaw= await client.getPDBInfos(ref);
        return infosRaw.map((info) => {
            return {
                itemId: info.structure_name,
                chainIds: info.chain_ids.split(','),
                exactMatches: info.exact_matches.split(','),
                featureId: info.feature_id,
                featureType: info.feature_type,
                // TODO: ensure is MolstarFormat (i.e. type assertion function)
                format: info.file_extension as MolstarFormat,
                fileExtension: info.file_extension,
                filePath: info.file_path,
                fromRCSB: info.from_rcsb === 1,
                genomeName: info.genome_name,
                genomeRef: info.genome_ref,
                isModel: info.is_model === 1,
                modelIds: info.model_ids.split(','),
                narrativeId: info.narrative_id,
                sequenceIdentities: info.sequence_identities.split(','),
                structureName: info.structure_name
            }
        });
    }
}