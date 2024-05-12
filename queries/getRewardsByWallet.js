import { gql } from '@apollo/client'

export default gql`
query Wallets($address: String) {
    queryWallet(filter: {address: {eq: $address}}) {
        address
        assets {
            id
            asset_id
            name
            qty
            unitname
            verified
            transactions(filter: {receiver: {eq: $address}},order: {desc: createdat}, first: 10) {
                amountpaid
                asset_id
                createdat
                id
                txid
                tokenname
                tokenunit
            }
        }
    }
    queryWhitelist(filter: {collection_id: {eq: "base"}}) {
      asset_id
      reserve
      unitname
      collection_id
    }
}`