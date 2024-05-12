import { gql } from '@apollo/client'

export default gql`
query Tokens {
    queryTokens(filter: {isactive: true, isstaking: true}) {
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
    queryWhitelist {
      asset_id
      name
      reserve
      unitname
      collection_id
    }
    aggregateStakedAssets {
      count
    }
}`