/* eslint-disable no-console */
import {platform_settings as ps} from './platform-conf'
import algosdk, {LogicSigAccount} from 'algosdk'  
import Listing from "./listing";
import { NFT } from "./nft";
import { showErrorToaster, showNetworkError, showNetworkSuccess, showNetworkWaiting } from "../src/Toaster";

export const dummy_addr = "b64(YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=)"
export const dummy_id = "b64(AAAAAAAAAHs=)"

type Holdings= {
    price: number
    nft: NFT
};

type Portfolio = {
    listings: Listing[]
    nfts: NFT[]
}

let client = undefined;
export function getAlgodClient(){
    if(client===undefined){
        const {token, server, port} = ps.algod
        client = new algosdk.Algodv2(token, server, port)
    }
    return client
}

let indexer = undefined;
export function getIndexer() {
    if(indexer===undefined){
        const {token, server, port} = ps.indexer
        indexer = new algosdk.Indexer(token, server, port)
        //indexer = new algosdk.Indexer({ 'X-API-key' : token}, server, port)
    }
    return indexer
}

export async function getLogicFromTransaction(addr: string): Promise<LogicSigAccount> {
    const indexer = getIndexer()
    const txns = await indexer.searchForTransactions()
        .address(addr).do()

    for(let tidx in txns.transactions){
        const txn = txns.transactions[tidx]
        if(txn.sender == addr){
            const program_bytes = new Uint8Array(Buffer.from(txn.signature.logicsig.logic, "base64"));
            return new LogicSigAccount(program_bytes);
        }
    }
    return undefined
}

export async function isOptedIntoApp(address: string): Promise<boolean> {
    //const client = getAlgodClient()
    const indexer  = getIndexer()
    //const result = await client.accountInformation(address).do()
    const result = await indexer.lookupAccountByID(address).do()
    const optedIn = result.account['apps-local-state'].find((r)=>{ return r.id == ps.application.app_id })
    return optedIn !== undefined 
}

export async function isOptedIntoAssets(address: string, assets: any): Promise<any> {
    const indexer  = getIndexer()
    const result = await indexer.lookupAccountByID(address).do()
    const gets = []
    for(let asset in assets){
        const optedIn = result.account['assets'].find((r)=>{ return r['asset-id'] == assets[asset].asset_id })
        if(optedIn !== undefined){
            gets.push({ asset_id: optedIn['asset-id'], optin: false})
        } else {
            gets.push({ asset_id: assets[asset].asset_id, optin: true})
        }
    }
    //return gets
    return getUnique(gets, 'asset_id')
}

export async function isOptedIntoAsset(address: string, idx: number): Promise<boolean> {
    const indexer  = getIndexer()
    const result = await indexer.lookupAccountByID(address).do()
    const optedIn = result.account['assets'].find((r)=>{ return r['asset-id'] == idx })
    //console.log("optedIn",optedIn)
    return optedIn !== undefined 
}

export async function isListing(address: string): Promise<boolean> {
    const indexer  = getIndexer()
    const result = await indexer.lookupAccountByID(address).do()
    const hasPriceToken = result.account['assets'].find((r)=>{ return r['asset-id'] == ps.application.price_id })
    return hasPriceToken !== undefined
}


export async function getAvailablePools(addr: string, verifiedWallets: any, whitelistAsa: any, tokens: any): Promise<Portfolio> {
    const indexer  = getIndexer()
    const portfolio: Portfolio = {listings:[], nfts:[]}
    //console.log("wallet-verifiedWallets",verifiedWallets)
    //console.log("wallet-whitelistAsa",whitelistAsa)
    let acct = undefined
    try{
        const accountInfo = await indexer.lookupAccountByID(addr).do()
        acct  = accountInfo.account
    } catch(error) {
        console.log("walletwallet-error: addy: " + addr, error)
        return portfolio
    }
    const np = []
    //FYI we cannot use multi print nfts on our system
    /* const deployedAssets = [832356403, 639771578, 639800010, 639833257, 639805844, 639802791, 639836668, 639838898, 639854780, 639856997, 639941028, 639944278, 639947967, 639950936, 
        815500211, 639792151, 639827752, 639938487, 639927786, 639795103, 639930605, 639978894, 639987121, 639989958, 639996378, 640003782,
        640011581, 640032747, 640036185, 640041673, 640056587, 640060418, 640067855, 640070898, 640083323, 640085910, 640088778, 640092068, 640094563, 640097023, 640101933,
        640104299, 640108309, 640110607, 646446898, 763543997, 763565364, 763626451, 763633973, 763650095, 763654817, 763660047, 763662831, 763668868, 763670189, 763743002,
        764822106, 764826261, 765639311, 765645276, 765647667, 765661394, 765666039, 765668422, 765671431, 765672325, 765673959, 765677490, 766594634, 766597657, 767177749,
        768372754, 768372977, 768455412, 768464627, 769486764, 775414299, 776452711, 776456620, 776617662, 776624516, 776628128, 780040775, 780044964, 780047235, 780151525, 
        780153214, 785149990, 800541192]
  
    */
    //clean up json to array with just the asset_id
    let cleanedAssets = whitelistAsa.reduce((pre, cur) => {
        //pre.push(cur['asset_id'])
        pre.push({ asset_id: cur['asset_id'], amount: 1, collection_id: cur['collection_id']})
        return pre
    }, [])
    
    let indexes: any = Array.from(new Set(cleanedAssets))
    //console.log("wallet-allowed_indexes",indexes)

    let allowed_nft_array = acct['assets'].reduce((pre, cur) => {
        //indexes.has(cur['asset-id']) && pre.push(cur, indexes)
        //console.log("wallet-cur", cur)
        if(cur['amount'] > 0) {
            const index2 = indexes.map((item: any) => item?.asset_id).indexOf(cur['asset-id']);
            (index2>=0) && pre.push(indexes[index2])
        }
        return pre
    }, [])
    //console.log("wallet-allowed_nft_array",allowed_nft_array)
    for(let aidx in allowed_nft_array) {
    //for(let aidx in acct['assets']) {
        const ass = allowed_nft_array[aidx]
        if (ass.amount == 0) continue
        //this was the first NFT we minted 639771578 so we dont care about skimming over any PRIOR ones
        if (ass['asset-id'] < 1698932180) continue
        try {
            np.push(tryGetNFT(ass['asset_id'], ass['amount'], ass['collection_id'], verifiedWallets, tokens, acct).then((nft)=>{
                //console.log("walletwallet-nft",nft)
                if (nft !== undefined) portfolio.nfts.push(nft)
            }))
        } catch(error) {
            showErrorToaster("couldn't parse nft for asset: "+ ass['asset_id'])
        }
    }
    await Promise.all(np)

    return await portfolio
}
export async function tryGetNFT(asset_id: number, amount: number, collection_id: string, verifiedWallets: any, tokens: any, accountInfo: any): Promise<NFT> {
    try {
        const token = await getToken(asset_id, amount, collection_id, verifiedWallets, tokens, accountInfo)
        //console.log("tryGetNFTadsadadsa", token)
        //return await NFT.fromToken(token)
        return await NFT.fromToken(token.lookupAssetByID, token.tokenBal.filter(t => t.asset_id === asset_id)[0]?.balance)
    } catch (error) { 
        //showErrorToaster("Cant find asset_id: " + asset_id)
        //console.error("tryGetNFT - Cant find asset_id: ", asset_id + ": " + error);
    }

    return undefined 
}

export async function getToken(asset_id: number, amount: number, collection_id: string, verifiedWallets: any, tokens: any, accountInfo: any): Promise<any> {
    
    const indexer  = getIndexer()
    const assets = []
    const tokenBal = []
    const walletAssets = []
    const optOutAssets = []
    const lookupAssetByID = await indexer.lookupAssetByID(asset_id).do()
    //check if its a NFT or token
    //if(lookupAssetByID.asset.params.decimals > 1 && asset_id !== 1691271561) return undefined
    lookupAssetByID.asset.validatedStaking = false
    lookupAssetByID.asset.transactions = []
    lookupAssetByID.asset.alltokenrewards = []
    lookupAssetByID.asset.note = ''
    lookupAssetByID.asset.amount = amount
    lookupAssetByID.asset.collection_id = collection_id

    let algoBalance = 0
    if(accountInfo !== undefined) {
        algoBalance = accountInfo?.amount
        for(let asset in accountInfo?.assets){
            assets.push({ asset_id: accountInfo?.assets[asset]['asset-id'], optin: false})
            if(accountInfo?.assets[asset]['amount']>0){
                walletAssets.push({ asset_id: accountInfo?.assets[asset]['asset-id'], amount: accountInfo?.assets[asset]?.amount})
            } else {
                optOutAssets.push({ asset_id: accountInfo?.assets[asset]['asset-id'], amount: accountInfo?.assets[asset]?.amount})
            }
        }
    }
    for(let token in tokens){
        const tokenMatch = (accountInfo !== undefined) ? accountInfo?.assets?.find((r)=>{ return r['asset-id'] == tokens[token].asset_id }) : undefined
        tokenBal.push({ asset_id: tokens[token].asset_id, 
                        balance:(tokenMatch !== undefined)? tokenMatch['amount'] : 0, 
                        name: tokens[token].name, 
                        unitname: tokens[token].unitname, 
                        isactive: tokens[token].isactive, 
                        decimal: tokens[token].decimal, 
                        rate: tokens[token].rate //'Loading...' //(data)? data.price.toFixed(3) : 
        })
    }
    if(lookupAssetByID.asset.params.creator === ps.application.owner_addr2 || lookupAssetByID.asset.params.creator == ps.application.owner_addr ||
       lookupAssetByID.asset.params.creator === ps.application.owner_addr3 || lookupAssetByID.asset.params.creator == ps.application.owner_addr4 ||
       lookupAssetByID.asset.params.creator === ps.application.owner_addr5 || lookupAssetByID.asset.params.creator == ps.application.owner_addr6 ||
       lookupAssetByID.asset.params.creator === ps.application.owner_addr7) {
        
        //console.log("lookupAssetByID", lookupAssetByID.asset);
        try {
            //const matchAssets = await verifiedWallets[0]?.assets.find((a) => Number(a.asset_id) === asset_id )
            const matchAssets = await (verifiedWallets[0] !== undefined)? verifiedWallets[0].stakedassets.find((a) => Number(a.asset_id) === asset_id ) : undefined
            //console.log("lookupAssetByID-verifiedWallets",  verifiedWallets)
            //console.log("lookupAssetByID-matchAssets",  matchAssets)
            if(matchAssets !== undefined) {
                lookupAssetByID.asset.transactions = matchAssets.assetstransactions
                lookupAssetByID.asset.validatedStaking = matchAssets.verified
                lookupAssetByID.asset.id = matchAssets.id
                lookupAssetByID.asset.stakedamount = matchAssets.amountstaked
                for(let asset in matchAssets.assetstransactions[0].groupby){
                    lookupAssetByID.asset.alltokenrewards.push({token: matchAssets.assetstransactions[0].groupby[asset].tokenunit, 
                        value: matchAssets.assetstransactions[0].groupby[asset].totalpaid })
                }
            }
        } catch (error) { 
            //console.error("tryverifiedWallets: ", asset_id + ": " + error);
        }
        const txns = await indexer.searchForTransactions().txType("acfg").assetID(asset_id).do()
    
        for(let tidx in txns.transactions){
            const txn = txns.transactions[tidx]
            //if(txn.sender == addr){
                //console.log("transactions", txn)
            //}
            lookupAssetByID.asset.note = txn.note
        }

    }else {
        //return undefined
        lookupAssetByID.asset.transactions = []
        lookupAssetByID.asset.validatedStaking = false
        lookupAssetByID.asset.id = asset_id
        lookupAssetByID.asset.stakedamount = 0
        lookupAssetByID.asset.amountpaid = 0
    }

    return { lookupAssetByID: await lookupAssetByID.asset, walletassets: walletAssets, assets: assets, tokenBal: tokenBal, algoBalance: algoBalance }

}

export async function getOwner(asset_id: number):Promise<string> {
    const client = getIndexer()
    const balances = await client.lookupAssetBalances(asset_id).currencyGreaterThan(0).do()

    //TODO: wen js-sdk take out
    const holders = []
    for(const idx in balances['balances']){
        const bal = balances['balances'][idx]
        if(bal.amount>0){
            holders.push(bal.address)
        }
    }

    if(holders.length==1){
        return holders[0]
    }
    return ""
}

export async function getCreator(addr: string, asset_id: number): Promise<string> {
    // Find the txn that xfered the asa to this addr, sender is creator
    const indexer = getIndexer()

    const txns = await indexer
        .searchForTransactions()
        .address(addr)
        .currencyGreaterThan(0)
        .assetID(asset_id)
        .do()

    for(let idx in txns.transactions){
        const txn = txns.transactions[idx]
        if(txn.sender != addr){
            return txn.sender
        }
    }
}

export async function getSuggested(rounds){
    const client = getAlgodClient();
    const txParams = await client.getTransactionParams().do();
    return { ...txParams, lastRound: txParams['firstRound'] + rounds }
}


export function uintToB64(x: number): string {
    return Buffer.from(algosdk.encodeUint64(x)).toString('base64')
}

export function addrToB64(addr: string): string {
    if (addr == "" ){
        return dummy_addr
    }
    try {
        const dec = algosdk.decodeAddress(addr)
        return "b64("+Buffer.from(dec.publicKey).toString('base64')+")"
    }catch(err){
        return dummy_addr
    }
}
export function b64ToAddr(x){
    return algosdk.encodeAddress(new Uint8Array(Buffer.from(x, "base64")));
}

export async function sendWait(signed: any[]): Promise<any> {
    const client = getAlgodClient()

    if(ps.dev.debug_txns) download_txns("grouped.txns", signed.map((t)=>{return t.blob}))

    try {
        const {txId}  = await client.sendRawTransaction(signed.map((t)=>{return t.blob})).do()
        showNetworkWaiting(txId)

        const result = await waitForConfirmation(client, txId, 3)
        showNetworkSuccess(txId)

        return result 
    } catch (error) { 
        //showNetworkError("Test", error) 
    }

    return undefined 
}


export async function getTransaction(txid: string) {
    return await waitForConfirmation(getAlgodClient(), txid, 3)
}

export async function waitForConfirmation(algodclient, txId, timeout) {
    if (algodclient == null || txId == null || timeout < 0) {
      throw new Error('Bad arguments.');
    }

    const status = await algodclient.status().do();
    if (typeof status === 'undefined')
      throw new Error('Unable to get node status');

    const startround = status['last-round'] + 1;
    let currentround = startround;
  
    /* eslint-disable no-await-in-loop */
    while (currentround < startround + timeout) {
      const pending = await algodclient
        .pendingTransactionInformation(txId)
        .do();

      if (pending !== undefined) {
        if ( pending['confirmed-round'] !== null && pending['confirmed-round'] > 0) 
          return pending;
  
        if ( pending['pool-error'] != null && pending['pool-error'].length > 0) 
          throw new Error( `Transaction Rejected pool error${pending['pool-error']}`);
      }

      await algodclient.statusAfterBlock(currentround).do();
      currentround += 1;
    }

    /* eslint-enable no-await-in-loop */
    throw new Error(`Transaction not confirmed after ${timeout} rounds!`);
}

export function getUnique(array, key) {
  if (typeof key !== 'function') {
    const property = key;
    key = function(item) { return item[property]; };
  }
  return Array.from(array.reduce(function(map, item) {
    const k = key(item);
    if (!map.has(k)) map.set(k, item);
    return map;
  }, new Map()).values());
}

export function download_txns(name, txns) {
    let b = new Uint8Array(0);
    for(const txn in txns){
        b = concatTypedArrays(b, txns[txn])
    }
    var blob = new Blob([b], {type: "application/octet-stream"});

    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = name;
    link.click();
}

export function concatTypedArrays(a, b) { // a, b TypedArray of same type
    var c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}