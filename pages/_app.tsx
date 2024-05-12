import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import '../styles/globals.css'
import { NavigtionProvider } from "../src/contexts/navigation.context";
import { ApolloProvider } from "@apollo/client";
import client from "../lib/apollo";
import '@fontsource/abel';

const theme = extendTheme({
  config: {
    useSystemColorMode: false,
    initialColorMode: "dark",
  },
  components: {
    Button: {
      baseStyle: {
        color: "#efefef",
        fontFamily: `'Abel', sans-serif`
      },
    },
    MenuItem: {
      baseStyle: {
        color: "#efefef",
        fontFamily: `'Abel', sans-serif`
      },
    },
    FormLabel: {
      baseStyle: {
        color: "#efefef", 
      },
    },
    StatLabel: {
      baseStyle: {
        color: "#efefef", 
      },
    },
    Input: {
      baseStyle: {
        color: "#efefef", 
      },
    },
    Text: {
      baseStyle: {
        color: "#efefef", 
        fontFamily: `'Abel', sans-serif`
      },
    }
  },
  fonts: {
    heading: `'Abel', sans-serif`,
  },
  fontSizes: {},
  breakpoints: {
    sm: "320px",
    md: "768px",
    lg: "960px",
    xl: "1200px",
  },
  styles: {
    global: (props) => ({
      'html, body': {
        background: props.colorMode === 'dark' ? '#000000' : '#000000',
      },
      a: {
        color: props.colorMode === 'dark' ? '#efefef' : '#efefef',
      },
    }),
  },
});

function App({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <ApolloProvider client={client}>
        <NavigtionProvider>
          <Component {...pageProps} />
        </NavigtionProvider>
      </ApolloProvider>
    </ChakraProvider>
  )
}

export default App
