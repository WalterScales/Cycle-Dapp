import nextConnect from 'next-connect'
import { INSERT_VERIFIED_WALLETS } from "../../queries/insertVerifiedWallet"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    //console.log("staking data", data)
    await client.mutate({
        mutation: INSERT_VERIFIED_WALLETS,
        variables: { wallet: { address: data.address, 
            stakedassets: { name: data.name, 
                amountstaked: data.amountstaked, 
                image: data.image, 
                unitname: data.unitname, 
                reserve: data.reserve, 
                collection_id: data.collection_id, 
                verified: true,
                asset_id: data.asset_id 
            }}},
    }).then((senddata) => {
        //console.log("successfully staked", senddata)
        res.json({success: true, message: 'successfully staked'})
    }).catch((err)=>{ 
        //console.log("error staking", err)
        res.json({success: false, message: 'error staking'})
    }) 
}) 

export default handler