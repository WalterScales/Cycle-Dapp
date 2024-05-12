import nextConnect from 'next-connect'
import { UPDATE_ASSET } from "../../queries/updateAsset"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    //console.log("updating stake", data)
    await client.mutate({
        mutation: UPDATE_ASSET,
        variables: { id: data.id, amountstaked: data.amountstaked },
    }).then((senddata) => {
        //console.log("successfully updated stake", senddata)
        res.json({success: true, message: 'successfully updated stake'})
    }).catch((err)=>{ 
        //console.log("error unstaking", err)
        res.json({success: false, message: 'error updating stake'})
    }) 
}) 

export default handler