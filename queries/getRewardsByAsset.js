import { gql } from '@apollo/client'

export default gql`
subscription Asset($asset_id: Int, $address: String, $first: Int, $offset: Int) {
  queryWallet(filter: {address: {eq: $address}}) {
    stakedassets(filter: {asset_id: {eq: $asset_id}}) {
      name
      image
      collection_id
      asset_id
      amountstaked
      unitname
      verified
      transactions(first: $first, offset: $offset, order: {desc: createdat}) {
        tokenunit
        txid
        tokenname
        receiver
        id
        asset_id
        amountpaid
        createdat
      }
      transactionsAggregate {
        count
      }
    }
  }
}`