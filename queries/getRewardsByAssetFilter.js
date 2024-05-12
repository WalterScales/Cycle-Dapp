import { gql } from '@apollo/client'

export default gql`
subscription Asset($asset_id: Int, $address: String, $first: Int, $offset: Int, $tokenfilter: String) {
    queryStakedAssets(filter: {asset_id: {eq: $asset_id}}) {
      asset_id
      amountstaked
      name
      image
      verified
      reserve
      collection_id
      unitname
      transactions(filter: {receiver: {eq: $address}, tokenunit: {eq: $tokenfilter}}, first: $first, offset: $offset, order: {desc: createdat}) {
        id
        asset_id
        amountpaid
        txid
        tokenunit
        tokenname
        receiver
        createdat
      }
      transactionsAggregate(filter: {tokenunit: {eq: $tokenfilter}}) {
        count
      }
    }
}`