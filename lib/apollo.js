import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client"
import { setContext } from '@apollo/client/link/context';
import { platform_settings as ps } from './platform-conf'

const httpLink = createHttpLink({
    uri: ps.graphQL,
  });
  
  const authLink = setContext((_, { headers }) => {
    // get the API key from local storage if it exists
    const key = ps.graphQLkey; // API key
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        //@ts-ignore
        'DG-Auth': key ?? undefined,
      }
    }
  });

const client = new ApolloClient({
    ssrMode: typeof window === "undefined", // set to true for SSR
    link: authLink.concat(httpLink), //ps.graphQL,
    cache: new InMemoryCache(),
    headers: {
      fetchOptions: {
        mode: 'no-cors',
      },
    },
});

export default client