import { gql } from '@apollo/client'

const UPDATE_ASSET = gql`
  mutation updateStakedAssets($id: [ID!], $amountstaked: Float!) {
    updateStakedAssets(input: {filter: {id: $id}, set: {amountstaked: $amountstaked, verified: true}}) {
        numUids
    }
  }
`;

export { UPDATE_ASSET };