import { gql } from '@apollo/client'

const INSERT_VERIFIED_WALLETS = gql`
  mutation addWallet($wallet: [AddWalletInput!]!) {
    addWallet(input: $wallet, upsert: true) {
      numUids
    }
  }
`;

export { INSERT_VERIFIED_WALLETS };