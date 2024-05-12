import nextConnect from 'next-connect'
import { REMOVE_VERIFIED_WALLETS } from "../../queries/removeVerifiedWallet"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    //console.log("unstaking data", data)
    await client.mutate({
        mutation: REMOVE_VERIFIED_WALLETS,
        variables: { address: data.address, asset_id: data.asset_id },
    }).then((senddata) => {
        //console.log("successfully unstaked", senddata)
        res.json({success: true, message: 'successfully unstaked'})
    }).catch((err)=>{ 
        //console.log("error unstaking", err)
        res.json({success: false, message: 'error unstaking'})
    }) 
}) 

export default handler