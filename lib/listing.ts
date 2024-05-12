import { get_template_vars, platform_settings as ps} from './platform-conf'
import {
    uintToB64, 
    addrToB64, 
    getSuggested, 
    sendWait,
    getLogicFromTransaction
} from './algorand'
import algosdk, { Transaction } from 'algosdk';
import { NFT } from './nft' 


export enum Method {
    Create = "Y3JlYXRl",
    Delete = "ZGVsZXRl",
    Tag = "dGFn",
    Untag = "dW50YWc=",
    PriceIncrease = "cHJpY2VfaW5jcmVhc2U=",
    PriceDecrease = "cHJpY2VfZGVjcmVhc2U=",
    Purchase = "cHVyY2hhc2U=",
}

export class Listing {
    asset_id: number
    price: number
    creator_addr: string
    contract_addr: string
    nft: NFT
    source: string

    constructor(price: number, asset_id: number, creator_addr: string, contract_addr?: string) {
        this.price = price
        this.asset_id = asset_id
        this.creator_addr = creator_addr
        this.contract_addr = contract_addr
    }

    getVars() {
        return get_template_vars({
            "TMPL_ASSET_ID":"b64("+uintToB64(this.asset_id)+")",
            "TMPL_CREATOR_ADDR": addrToB64(this.creator_addr)
        })
    }

}

export default Listing;