import { gql } from '@apollo/client'

const REMOVE_VERIFIED_WALLETS = gql`
  mutation deleteStakedAssetByWallet($address: String!, $asset_id: Int!) {
    deleteStakedAssetByWallet(address: $address, asset_id: $asset_id) {
      msg
      numUids
    }
  }
`;

export { REMOVE_VERIFIED_WALLETS };