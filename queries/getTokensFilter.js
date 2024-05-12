import { gql } from '@apollo/client'

export default gql`
query Tokens($asset_id: Int, $first: Int, $offset: Int) {
    queryWhitelist(filter: {collection_id: {eq: "base"}, asset_id: {eq: $asset_id}}, first: $first, offset: $offset, order: {asc: asset_id}) {
        asset_id
        description
        id
        image
        mime_type
        name
        reserve
        unitname
        qty
        verified
        website
        collection_id
    }
    queryTokens(filter: {isactive: true}) {
        id
        name
        maxamount
        asset_id
        apy
        unitname
        website
        frequency
        isactive
        collection_id
    }
    aggregateStakedAssets(filter: {collection_id: {eq: "base"}}) {
      count
    }
    aggregateWhitelist(filter: {collection_id: {eq: "base"}, asset_id: {eq: $asset_id}}) {
      count
    }
}`