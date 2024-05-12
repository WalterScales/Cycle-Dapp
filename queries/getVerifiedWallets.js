import { gql } from '@apollo/client'

export default gql`
subscription StakingRewardsByAddress($address: String) {
  StakingRewardsByAddress(search: $address) {
    id
    address
    stakedassets {
      id
      name
      verified
      amountstaked
      collection_id
      asset_id
      image
      unitname
      assetstransactions {
        groupby {
          tokenunit
          totalpaid
        }
      }
    }
  }
}`