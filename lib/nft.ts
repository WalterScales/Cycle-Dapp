import { Wallet } from '../lib/algorand-session-wallet'
import { getMetaFromIpfs, getArc69MetaFromIpfs, getMimeTypeFromIpfs, getArc69MetaFromHash, getTokenMetaFromHash } from './ipfs'
import { decodeAddress, assignGroupID, Transaction } from 'algosdk'
import { sendWait, getSuggested } from './algorand'
import { get_asa_create_txn, get_asa_xfer_txn, get_pay_txn, get_asa_destroy_txn} from './transactions'
import { platform_settings as ps } from './platform-conf'
import { showErrorToaster } from '../src/Toaster'
import { sha256 } from 'js-sha256'
import { CID } from 'multiformats/cid'
import * as mfsha2 from 'multiformats/hashes/sha2'
import * as digest from 'multiformats/hashes/digest'
import { CIDVersion } from 'multiformats/types/src/cid'

export const ARC3_NAME_SUFFIX = "@arc3"
export const ARC3_URL_SUFFIX = "#arc3"
export const ARC69_NAME_SUFFIX = "@arc69"
export const ARC69_URL_SUFFIX = "#arc69"
export const METADATA_FILE = "metadata.json"
export const JSON_TYPE = "application/json"

export const asaURL = (cid) => ipfsURL(cid) + ARC3_URL_SUFFIX
export const asaArc69URL = (cid) => ipfsURL(cid) + ARC69_URL_SUFFIX
export const ipfsURL = (cid) => `ipfs://${cid}`
export const fileURL = (cid, name) => `${ps.ipfs.ipfsGateway + cid}/${name}`

export function resolveProtocol(url) {
  if (url.endsWith(ARC3_URL_SUFFIX))
    url = url.slice(0, url.length - ARC3_URL_SUFFIX.length)
  if (url.endsWith(ARC69_URL_SUFFIX))
    url = url.slice(0, url.length - ARC69_URL_SUFFIX.length)
  const chunks = url.split("://")

  // No protocol specified, give up
  if (chunks.length < 2) return url

  // Switch on the protocol
  switch (chunks[0]) {
    case "ipfs": // Its ipfs, use the configured gateway
      return ps.ipfs.ipfsGateway + chunks[1]
    case "https": // Its already http, just return it
      return url
    default:
      return null
    // TODO: Future options may include arweave or algorand
  }
}

export class NFT {
    asset_id: number // ASA idx in algorand
    collection_id: number // ASA collection_id in dApp
    amount: number // ASA idx in algorand
    manager: string  // Current manager of the token representing this NFT
    reserve: string  // Current reserve of the token representing this NFT
    url: string      // URL of metadata json
    decimals: number  // Current manager of the token representing this NFT
    verified: boolean // IF the nft for this wallet was verified or not
    amountpaid: any // Total paid rewards per nft / per token
    stakedamount: any // Total amt staked
    tokenBalance: any
    id: any
    alltokenrewards: any // Total paid rewards per nft / per token
    unitname: string
    metadata: NFTMetadata
    transactions: Transactions

    constructor(metadata: any, 
        transactions: any,
        asset_id?: number,
        collection_id?: number, 
        amount?: number,
        manager?: string, 
        reserve?: string, 
        decimals?: number, 
        verified?: boolean, 
        amountpaid?: any,
        stakedamount?: any,
        tokenBalance?: any,
        id?: any, 
        alltokenrewards?: any,
        unitname?: string ) 
    {
        this.metadata = metadata
        this.transactions = transactions
        this.asset_id = asset_id
        this.collection_id = collection_id
        this.amount = amount
        this.manager = manager
        this.reserve = reserve
        this.decimals = decimals
        this.verified = verified
        this.amountpaid = amountpaid
        this.stakedamount = stakedamount
        this.tokenBalance = tokenBalance
        this.id = id
        this.alltokenrewards = alltokenrewards
        this.unitname = unitname
    }

    async verifyToken(wallet: Wallet) {
        /* const creator = wallet.getDefaultAccount()
        const suggested = await getSuggested(10)
        const verify_txn = new Transaction(await get_asa_destroy_txn(suggested, creator, this.asset_id))
        const [s_verify_txn] = await wallet.signTxn([verify_txn])
        return await sendWait([s_verify_txn]) */
        const suggestedParams = await getSuggested(10)
        const buyer = await wallet.getDefaultAccount()
        //JUST SENDING A 0.00 DOLLAR TRANSACTION
        const purchase_amt_txn = new Transaction(get_pay_txn(suggestedParams, buyer, ps.application.admin_addr, 0))

       /*  const price_xfer_txn = new Transaction(get_asa_xfer_txn(suggestedParams, this.contract_addr, ps.application.owner_addr, ps.application.price_id, 0))
        price_xfer_txn.closeRemainderTo = decodeAddress(ps.application.owner_addr)

        const asa_xfer_txn = new Transaction(get_asa_xfer_txn(suggestedParams, this.contract_addr, buyer, this.asset_id, 0))
        asa_xfer_txn.closeRemainderTo = decodeAddress(buyer)

        const algo_close_txn = new Transaction(get_pay_txn(suggestedParams, this.contract_addr, ps.application.owner_addr, ps.application.fee_amt))
        algo_close_txn.closeRemainderTo = decodeAddress(creator) */

        const grouped = [
            purchase_amt_txn
        ]

        assignGroupID(grouped)


        const [s_purchase_amt_txn, /*asa_xfer*/, /*price_xfer*/, /*asa_cfg*/ , /* tag_txns */, /*algo_close*/] = await wallet.signTxn(grouped)

        /* const listing_lsig     = await getLogicFromTransaction(this.contract_addr)
        const s_price_xfer_txn = algosdk.signLogicSigTransaction(price_xfer_txn, listing_lsig)
        const s_asa_xfer_txn   = algosdk.signLogicSigTransaction(asa_xfer_txn, listing_lsig)
        const s_algo_close_txn = algosdk.signLogicSigTransaction(algo_close_txn, listing_lsig) */

        const combined = [
            s_purchase_amt_txn
        ]

        return await sendWait(combined) !== undefined   
    }

    async verifyTokenWAlgo(wallet: Wallet) {
        const suggestedParams = await getSuggested(10)
        const buyer = await wallet.getDefaultAccount()
        var string = `CYCLE Rewards Staking One Time 0A Verification Transaction on https://app.blockcycle.org/`
        var uint8 = Uint8Array.from(string.split("").map(x => x.charCodeAt(0)))
        //JUST SENDING A 0.00 DOLLAR TRANSACTION
        const purchase_amt_txn = new Transaction(get_pay_txn(suggestedParams, buyer, ps.application.admin_addr, 0))
        const grouped = [purchase_amt_txn]
        assignGroupID(grouped)
        const [s_purchase_amt_txn] = await wallet.signTxn(grouped)
        const combined = [s_purchase_amt_txn]

        return await sendWait(combined) !== undefined   
    }

    explorerSrc(): string {
        const net = ps.algod.network == "mainnet" ? "" : ps.algod.network + "."
        return "https://" + net + ps.explorer + "/asset/" + this.asset_id
    }

    static arc3AssetName(name: string): string {
        if(name.length>27){
            name = name.slice(0,27)
        }
        return name + "@arc3"
    }
    
    static arc69AssetName(name: string): string {
        if(name.length>27){
            name = name.slice(0,27)
        }
        return name + "@arc69"
    }

    static resolveUrl(url: string, reserveAddr?: string): string {
        const [protocol, uri] = url.split("://")
        const chunks = url.split("://")
        // Check if prefix is template-ipfs and if {ipfscid:..} is where CID would normally be
        if (chunks[0] === 'template-ipfs' && chunks[1].startsWith('{ipfscid:')) {
            // Look for something like: template:ipfs://{ipfscid:1:raw:reserve:sha2-256} and parse into components
            chunks[0] = 'ipfs'
            const cidComponents = chunks[1].split(':')
            if (cidComponents.length !== 5) {
                // give up
                console.log('unknown ipfscid format')
                return url
            }
            const [, cidVersion, cidCodec, asaField, cidHash] = cidComponents

            // const cidVersionInt = parseInt(cidVersion) as CIDVersion
            if (cidHash.split('}')[0] !== 'sha2-256') {
                console.log('unsupported hash:', cidHash)
                return url
            }
            if (cidCodec !== 'raw' && cidCodec !== 'dag-pb') {
                console.log('unsupported codec:', cidCodec)
                return url
            }
            if (asaField !== 'reserve') {
                console.log('unsupported asa field:', asaField)
                return url
            }
            let cidCodecCode
            if (cidCodec === 'raw') {
                cidCodecCode = 0x55
            } else if (cidCodec === 'dag-pb') {
                cidCodecCode = 0x70
            }

            // get 32 bytes Uint8Array reserve address - treating it as 32-byte sha2-256 hash
            const addr = decodeAddress(reserveAddr)
            const mhdigest = digest.create(mfsha2.sha256.code, addr.publicKey)

            const cid = CID.create(parseInt(cidVersion) as CIDVersion, cidCodecCode, mhdigest)
            console.log('switching to id:', cid.toString())
            chunks[1] = cid.toString() + '/' + chunks[1].split('/').slice(1).join('/')
            console.log('redirecting to ipfs:', chunks[1])
        }
    // No protocol specified, give up
    if (chunks.length < 2) return url
        switch(chunks[0]){
            case "ipfs":
                return ps.ipfs.ipfsGateway + chunks[1]
            case "algorand":
                //TODO: create url to request note field?
                showErrorToaster("No url resolver for algorand protocol string yet")
                return 
            case "http":
                return url
            case "https":
                return url
        }

        showErrorToaster("Unknown protocol: " + protocol) 
        return  ""
    }

    static async fromToken(token: any, tokenBalance: any): Promise<NFT> {
        //console.log("fromTokenfromToken- ",token)
        if (token === undefined) return undefined;
        //let checkUrlExt = token.params.url.split(/[#?]/)[0].split('.').pop().trim()
        //if (checkUrlExt!=='json') return undefined;
        if(token?.index == 1691271561) {
            try {
                return new NFT(await getTokenMetaFromHash(token.params['unit-name'], token.params.name), 
                token.transactions, 
                token.index, 
                token.collection_id,
                token.amount, 
                token.params?.creator, 
                token.params?.reserve, 
                token.params.decimals, 
                token.validatedStaking, 
                token.amountpaid,
                token.stakedamount,
                tokenBalance,
                token.id, 
                token.alltokenrewards,
                token.params['unit-name'])
            } catch(error) {
                console.log("fromTokenAndLP error", error)
            }
        }
        
        const url = resolveProtocol(token.params.url)
        // TODO: provide getters for other storage options
        // arweave? note field?

        const urlMimeType = await getMimeTypeFromIpfs(url)
        //console.log("getMimeTypeFromIpfs",urlMimeType)

        // eslint-disable-next-line default-case
        switch (urlMimeType) {
            case JSON_TYPE:
            if (token.params.url.endsWith(ARC69_URL_SUFFIX)) {
                return new NFT(await getArc69MetaFromIpfs(url), 
                token.transactions, 
                token.index, 
                token.collection_id,
                token.amount, 
                token.params.creator, 
                token.params.reserve, 
                token.params.decimals, 
                token.validatedStaking, 
                token.amountpaid,
                token.stakedamount,
                tokenBalance,
                token.id, 
                token.alltokenrewards,
                token.params['unit-name'])
            } else if(token.params.url.endsWith(ARC3_URL_SUFFIX)) {
                return new NFT(await getMetaFromIpfs(url), 
                token.transactions, 
                token.index, 
                token.collection_id,
                token.amount, 
                token.params.creator, 
                token.params.reserve, 
                token.params.decimals, 
                token.validatedStaking,
                token.amountpaid,
                token.stakedamount,
                tokenBalance,
                token.id, 
                token.alltokenrewards,
                token.params['unit-name'])
                //return new NFT(await getNFTFromMetadata(token.params.url), token.index, token['params']['manager'])
            } else {
                console.log("fromTokenfromToken-urlMimeType",token)
            }
        }

        if (token.params.url.endsWith(ARC69_URL_SUFFIX)) {
            //return new NFT(ARC69Metadata.fromToken(token), token, urlMimeType)
            return new NFT(await getArc69MetaFromIpfs(url), 
            token.transactions, 
            token.index, 
            token.collection_id,
            token.amount, 
            token.params.creator, 
            token.params.reserve, 
            token.params.decimals, 
            token.validatedStaking, 
            token.amountpaid,
            token.stakedamount,
            tokenBalance,
            token.id, 
            token.alltokenrewards,
            token.params['unit-name'])
        } else if(token.params.url.endsWith(ARC3_URL_SUFFIX)) {
            return new NFT(await getMetaFromIpfs(url), 
            token.transactions, 
            token.index, 
            token.collection_id,
            token.amount, 
            token.params.creator, 
            token.params.reserve, 
            token.params.decimals, 
            token.validatedStaking, 
            token.amountpaid,
            token.stakedamount,
            tokenBalance,
            token.id, 
            token.alltokenrewards,
            token.params['unit-name'])
        } else {
            //console.log("fromTokenfromToken",token)
            return new NFT(await getArc69MetaFromHash(token.note, token.params['unit-name'], token.params.url, token.params.name), 
            token.transactions, 
            token.index, 
            token.collection_id,
            token.amount, 
            token.params.creator, 
            token.params.reserve, 
            token.params.decimals, 
            token.validatedStaking, 
            token.amountpaid,
            token.stakedamount,
            tokenBalance,
            token.id, 
            token.alltokenrewards,
            token.params['unit-name'])
        }
    }

    static emptyNFT(): NFT {
        return new NFT(emptyMetadata(), emptyTransactionsdata())
    }
}


export type Transactions = {
    id: string
    amountpaid: number
    asset_id: number
    tokenname: string
    tokenunit: string
    txid: string
    createdat: string
}

export function emptyTransactionsdata(): Transactions {
    return {
        id: "",
        amountpaid: 0,
        asset_id: 0,
        tokenname: "",
        tokenunit: "",
        txid: "",
        createdat: "",
    };
}

export type NFTMetadata = {
    name: string
    description: string
    image: string
    mime_type: string
    image_mimetype: string
    unitName: string
    reserve: string
    properties: {
        file: {
            name: string
            type: string
            size: number
        }
        artist: string
        trait_type: string
    }
}

export type ARC69Metadata = {
    standard: string
    description: string
    image: string
    total: number
    name: string
    unitName: string
    reserve: string
    royalty: number
    image_integrity: string
    image_mimetype: string
    properties: {
        file: {
            name: string
            type: string
            size: number
        }
        artist: string
        trait_type: string
    }
}

export function mdhash(md: NFTMetadata): Uint8Array {
    const hash = sha256.create();
    hash.update(JSON.stringify(md));
    return new Uint8Array(hash.digest())
}

export function emptyMetadata(): NFTMetadata {
    return {
        name: "",
        description: "",
        image: "",
        mime_type: "",
        image_mimetype: "",
        unitName: "",
        reserve: "",
        properties: {
            file: {
                name: "",
                type: "",
                size: 0,
            },
            artist: "",
            trait_type: "",
        }
    };
}
export function emptyARC69Metadata(): ARC69Metadata {
    return {
        standard: "",
        description: "",
        image: "",
        total: 0,
        name:  "",
        unitName:  "",
        reserve: "",
        royalty: 0,
        image_integrity:  "",
        image_mimetype:  "",
        properties: {
            file: {
                name: "",
                type: "",
                size: 0,
            },
            artist: "",
            trait_type: "",
        }
    };
}