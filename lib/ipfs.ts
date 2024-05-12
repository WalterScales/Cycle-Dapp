/* eslint-disable no-console */

import { NFT, NFTMetadata, ARC69Metadata } from './nft'
import { Base64 } from "js-base64";

//export async function getArc69MetaFromIpfs(url: string): Promise<NFT> {
export const getArc69MetaFromIpfs = async (url) => {
  
  const req = new Request(url)
  const resp = await fetch(req)
  const body = await resp.blob()
  const arc69MetaData = JSON.parse(await body.text()) as ARC69Metadata
  return arc69MetaData
  /* 
    const data =  await get_file(NFT.resolveUrl(url))
    if(data.toString() == 'null' || data == undefined) return undefined;
    const md = JSON.parse(data) as ARC69Metadata
    return new NFT(md) 
  */
}

export const getTokenMetaFromHash = async (unitname, name) => {
  //console.log("getTokenMetaFromHash", name)
  const Arc69MetaFromHash = JSON.parse('{"image": "","unitName": "","name": ""}') as ARC69Metadata
  Arc69MetaFromHash.image = "/placeholder.png"
  Arc69MetaFromHash.unitName = unitname
  Arc69MetaFromHash.name = name
  return Arc69MetaFromHash
}

export const getArc69MetaFromHash = async (metahash, unitname, url, name) => {
  if(metahash !== null && metahash !== undefined) {
    //console.log("metahash", metahash)
    //console.log("unitname", unitname)
    //console.log("url", url)
    //console.log("name", name)
    const Arc69MetaFromHash = JSON.parse(Base64.decode(metahash)) as ARC69Metadata
    Arc69MetaFromHash.image = url
    Arc69MetaFromHash.unitName = unitname
    Arc69MetaFromHash.name = name
    //console.log("Arc69MetaFromHash1", Arc69MetaFromHash)
    return Arc69MetaFromHash
  } else {
    const Arc69MetaFromHash = JSON.parse('{"image": "","unitName": "","name": ""}') as ARC69Metadata
    Arc69MetaFromHash.image = url
    Arc69MetaFromHash.unitName = unitname
    Arc69MetaFromHash.name = name
    return Arc69MetaFromHash
  }
}
export const getMimeTypeFromIpfs = async (url) => {
  const req = new Request(url, { method: "HEAD" })
  const resp = await fetch(req)
  return resp.headers.get("Content-Type")
}
export const getMetaFromIpfs = async (url) => {
  const req = new Request(url)
  const resp = await fetch(req)
  const body = await resp.blob()
  const bodyText = await body.text()
  //console.log("bodyText",bodyText)
  const NFTMetadata = JSON.parse(await body.text()) as NFTMetadata
  return NFTMetadata
  //return new NFTMetadata(JSON.parse(await body.text()))
}