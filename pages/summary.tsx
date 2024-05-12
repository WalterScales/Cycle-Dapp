import Head from 'next/head'
import {
  Box,
  Heading,
  Container, 
  VStack,
  Center,
  Grid, 
  GridItem,
  useColorModeValue,
  useBreakpointValue,
  Skeleton,
  Spinner,
  Text
} from '@chakra-ui/react';
import Link from 'next/link'
import * as React from 'react'
import Navigation from '../components/Navigation'
import { getAvailablePools, isOptedIntoAsset } from '../lib/algorand'
import { NFTListing } from '../src/NFTListing'
import { useNavigation } from "../src/contexts/navigation.context";
import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
import { platform_settings as ps } from '../lib/platform-conf'
import client from "../lib/apollo";
import GET_REWARDS_BY_WALLET from "../queries/getRewardsByWallet";
import favicon from "../public/favicon.ico";

export async function getServerSideProps(context) {
  //console.log("CONTEXTQUERY", context.query)
  const searchaddress = context.query.address? context.query.address : ''
  const { data } = await client.query({
    query: GET_REWARDS_BY_WALLET,
    variables: { address: searchaddress},
  });
  return {
    props: {
      //@ts-ignore
      WalletRewardHistory: data?.queryWallet,
      whitelistAsa: data?.queryWhitelist
    }
  }
}

export default function Summary(props) {
  const { WalletRewardHistory, whitelistAsa } = props;
  //console.log("historyofWallet",WalletRewardHistory)
  const colSpan = useBreakpointValue({ base: 1, md: 1})
  const { sessionWallet, connected, updateWallet } = useNavigation();
  const [loading, setLoading] = React.useState(false)
  const [listings, setListings] = React.useState([]);
  const colorText = useColorModeValue('black', 'white')
  const wallet = sessionWallet
  
  React.useEffect(()=>{ 
      if(sessionWallet === undefined || !connected) return 
      getStakingSummary(sessionWallet, WalletRewardHistory, whitelistAsa)
      return () => {
        setListings([]);
      };
      
  }, [sessionWallet, WalletRewardHistory, whitelistAsa, connected])

  const getStakingSummary = async (sessionWallet: any, WalletRewardHistory: any, whitelistAsa: any) => {
    
    const response = await fetch("/api/getAllAssets")
    const tokenData = await response.json()

    getAvailablePools(sessionWallet.getDefaultAccount(), WalletRewardHistory, whitelistAsa, tokenData).then((listing)=>{ 
      setListings(listing['nfts']) 
      setLoading(true)
      //console.log("history-avail",listing)
      //setListings(WalletRewardHistory[0].assets)
    }).catch((error) => {
      setLoading(true)
    });
  }
  if (!connected) {
    return (
      <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>Rewards History - Welcome to the Lab - Earn $CYCLE Rewards</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" h="90vh" centerContent>
        <Center h="100%">
          <VStack spacing={8}>
            <Heading color={colorText} as="h3" size="xl">
              Connect To Stake!
            </Heading>
            <AlgorandWalletConnector 
                        darkMode={true}
                        //@ts-ignore
                        sessionWallet={sessionWallet}
                        connected={connected} 
                        //@ts-ignore
                        updateWallet={updateWallet}
                        />
            <Text as="cite" color={colorText}>
              Powered by{" "}
              <Link href="https://www.flippingalgos.xyz">
                FlippingAlgos
              </Link>
            </Text>
          </VStack>
        </Center>
      </Container>
    </>
    );
  }
  return (
    <>
      <Head>
      <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
      <title>Rewards History - Welcome to the Lab - Earn $CYCLE Rewards</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" h="100%" centerContent>
           {!loading ? (
              <>
                <Center>
                    <Text fontSize='xl'>Loading...</Text>
                </Center>
                <Grid
                      templateRows="repeat(2, 1fr)"
                      templateColumns="repeat(1, 1fr)"
                      gap={5}
                      px={{ base: 0, md: 5}}
                      mt={{ base: 0, md: 5}}
                  > 
                      <GridItem colSpan={colSpan}>
                          <Box pl='8' pr='8'><Skeleton startColor='pink.500' endColor='blue.500' isLoaded={loading} width={{ base: '375px', md: '775px'}} height={{ base: '175px', md: '375px'}} /></Box>
                      </GridItem>
                      <GridItem colSpan={colSpan}>
                          <Box pl='8' pr='8'><Skeleton startColor='pink.500' endColor='blue.500' isLoaded={loading} width={{ base: '375px', md: '775px'}} height={{ base: '175px', md: '375px'}} /></Box>
                      </GridItem>
                      <GridItem colSpan={colSpan}>
                          <Box pl='8' pr='8'><Skeleton startColor='pink.500' endColor='blue.500' isLoaded={loading} width={{ base: '375px', md: '775px'}} height={{ base: '175px', md: '375px'}} /></Box>
                      </GridItem>
                  </Grid>
              </>
            ) : (
              <>
                <Center>
                    <Text fontSize='xl'>Rewards Summary</Text>
                </Center>
                {listings.length > 0 ? (
                    <Grid
                        templateRows="repeat(1, 1fr)"
                        templateColumns="repeat(1, 1fr)"
                        gap={4}
                        px={{ base: 0, md: 5}}
                        mt={{ base: 0, md: 5}}
                        w={'100%'}
                    > 
                        {listings.map((listing) => (
                            <GridItem w='100%' colSpan={colSpan} key={listing.asset_id}><NFTListing nft={listing} wallet={wallet}/></GridItem>
                        ))}
                    </Grid> 
                ) : (
                    <Container p={2} centerContent>
                        <Text>No Transactions Found</Text>
                    </Container>
                )}
             </>
          )}
      </Container>
    </>
  )
}
