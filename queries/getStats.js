import { gql } from '@apollo/client'

export default gql`
query queryAssetsReloadTransactions($first: Int, $offset: Int)  {
    queryWallet(filter: {has: stakedassets}, first: $first, offset: $offset) {
      id
      address
      stakedassets(filter: {collection_id: {eq: "base"}, verified: true}) {
        id
        amountstaked
        name
        unitname
        verified
        collection_id
      }
      stakedassetsAggregate(filter: {collection_id: {eq: "base"}, verified: true}) {
        count
        nameMin
        nameMax
      }
    }
    aggregateWallet(filter: {has: stakedassets}) {
      count
    }
    aggregateStakedAssets(filter: {collection_id: {eq: "base"}, verified: true}) {
      count
      amountstakedSum
      amountstakedAvg
    }
}`