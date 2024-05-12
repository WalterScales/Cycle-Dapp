import nextConnect from 'next-connect'
import GET_VERIFIED_WALLETS from "../../queries/getVerifiedWallets"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)

    await client.mutate({
        mutation: GET_VERIFIED_WALLETS,
        variables: { address: data.address }
    }).then((senddata) => {
        //console.log("get live staking data", senddata)
        res.status(200).json(senddata);
    }).catch((err)=>{ 
        console.log("error getting staking data", err)
    }) 
    //res.json(data)
}) 

export default handler