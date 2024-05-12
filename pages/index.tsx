import Head from 'next/head'
import {
  Box,
  Heading,
  Container, 
  VStack,
  Center,
  Grid, 
  GridItem,
  useMediaQuery,
  useColorModeValue,
  useBreakpointValue,
  Skeleton,
  Spinner,
  Text
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import * as React from 'react'
import Navigation from '../components/Navigation'
import { getAvailablePools, isOptedIntoAssets } from '../lib/algorand'
import { NFTCard } from '../src/NFTCard'
import { useNavigation } from "../src/contexts/navigation.context"
import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
import favicon from "../public/favicon.ico"


export default function HomePage(props) {
  //console.log("pools-verifiedWallets",props)
  const router = useRouter();
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)")
  const colSpan = useBreakpointValue({ base: 5, md: 1})
  const { sessionWallet, connected, updateWallet } = useNavigation()
  const [loading, setLoading] = React.useState(false)
  const [isOptIntoAsset, setOptIntoAsset] = React.useState([])
  const [listings, setListings] = React.useState([])
  const [tokenList, setTokenList] = React.useState([])
  const [whitelistAsa, setWhitelistAsa] = React.useState([])
  const [verifiedWallets, setVerifiedWallets] = React.useState([])
  const [totalAssetCount, setTotalAssetCount] = React.useState(0)
  const [listingsCount, setListingsCount] = React.useState(0)
  const [defaultWallet, setDefaultWallet] = React.useState('')
  const wallet = sessionWallet
  const colorText = useColorModeValue('gray.100', 'gray.100')

  React.useEffect(()=>{ 
      const handleFetchTokens = async () => {
        
        //if(sessionWallet.connect) {
          const defaultAccount = await sessionWallet.getDefaultAccount()
          setDefaultWallet(defaultAccount)
          //console.log("sessionWallet.getDefaultAccount()", defaultAccount)
          const stakingRewards = await fetch('/api/getStakingRewards', {
              method: 'POST',
              body: JSON.stringify({address: defaultAccount})
          })
          const stakingData = await stakingRewards.json()
      
          const response = await fetch("/api/getAllAssets")
          const tokenData = await response.json()
          //console.log("tokenData", tokenData)
          setVerifiedWallets(stakingData.data?.StakingRewardsByAddress)
          setTokenList(tokenData.data.queryTokens)
          setWhitelistAsa(tokenData.data.queryWhitelist)
          setTotalAssetCount(tokenData.data.aggregateStakedAssets['count'])
          isOptedIntoAssets(defaultAccount, tokenData.data.queryTokens).then((assetData)=> { 
            if(assetData) {
              //console.log("isOptedIntoAssets",assetData)
              setOptIntoAsset(assetData)
            }
          }).catch((err)=>{ 
              console.log("error isOptedIntoAssets",err)
          })
        }
      //}
      if(!sessionWallet.getDefaultAccount()) return 
        handleFetchTokens()
  }, [sessionWallet])
   
  React.useEffect(() => {
      if(!defaultWallet|| verifiedWallets === undefined || whitelistAsa === undefined || tokenList === undefined) return 

      let cancel = false;
      getAvailablePools(defaultWallet, verifiedWallets, whitelistAsa, tokenList).then((listing)=> { 
          if (cancel) return;
          console.log("getAvailablePools", listing)
          setListings(listing['nfts']) 
          setListingsCount(listing['nfts'].length)
          setLoading(true)
      }) 

      return () => { 
        cancel = true;
      }
  }, [defaultWallet, verifiedWallets, whitelistAsa, tokenList])

  if (!connected) {
    return (
      <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>Welcome to the Lab - Earn $CYCLE Rewards</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Box w="100%" h="90vh">
        <Center h="100%">
          <VStack spacing={8}>
            <Heading color={colorText} as="h3" size="xl">
              Connect To Cycle!
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
      </Box>
    </>
    );
  }
  return (
    <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>Welcome to the Lab - Earn $CYCLE Rewards</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Box w="100%" h="100%">
        {!loading ? (
              <>
              <Box mt='2'>
                <Center>
                  <VStack><Text fontSize='xl'>Loading...</Text><Spinner size='xl'/></VStack>
                </Center>
              </Box>
              <Box pl='6' pr='6' pt='2'>
                  <Grid
                      templateRows="repeat(2, 1fr)"
                      templateColumns="repeat(4, 1fr)"
                      gap={5}
                      px={{ base: 0, md: 5}}
                      mt={{ base: 0, md: 5}}
                  > 
                      <GridItem colSpan={colSpan}>
                          <Box pl='8' pr='8'><Skeleton startColor='gray.500' endColor='blue.500' isLoaded={loading} width='278px' height='538px' /></Box>
                      </GridItem>
                      <GridItem colSpan={colSpan}>
                          <Box pl='8' pr='8'><Skeleton startColor='gray.500' endColor='blue.500' isLoaded={loading} width='278px' height='538px' /></Box>
                      </GridItem>
                      <GridItem colSpan={colSpan}>
                          <Box pl='8' pr='8'><Skeleton startColor='gray.500' endColor='blue.500' isLoaded={loading} width='278px' height='538px' /></Box>
                      </GridItem>
                      <GridItem colSpan={colSpan}>
                          <Box pl='8' pr='8'><Skeleton startColor='gray.500' endColor='blue.500' isLoaded={loading} width='278px' height='538px' /></Box>
                      </GridItem>
                  </Grid>
              </Box>
              </>
            ) : (
              <>
              <Box pl={{ base: 0, md: 4}} pr={{ base: 0, md: 4}}>
                  <Center>
                      <Text color='black' fontSize='xl'>NFTs Available For Staking</Text>
                  </Center>
                  {listings.length > 0 && tokenList.length >= 0 && isOptIntoAsset.length >= 0 ? (
                    <Grid
                        templateRows="repeat(1, 1fr)"
                        templateColumns="repeat(4, 1fr)"
                        gap={4}
                        px={{ base: 0, md: 2}}
                        mt={{ base: 0, md: 1}}
                    > 
                        {listings.map((listing) => (
                            <GridItem colSpan={colSpan} key={listing.asset_id}>
                                  <NFTCard 
                                    nft={listing} 
                                    wallet={wallet} 
                                    totalAssetCount={totalAssetCount} 
                                    tokenList={tokenList} 
                                    isOptIntoAsset={isOptIntoAsset} 
                                    setOptIntoAsset={setOptIntoAsset} />
                            </GridItem>
                        ))}
                    </Grid>
                  ) : (
                    <Container p={2} centerContent>
                        <VStack><Text fontSize='xl' color={colorText}>Searching Wallet For Eligible NFTs ...</Text><Spinner size='xl'/></VStack>
                    </Container>
                  )}
              </Box>
              </>
            )}
      </Box>
    </>
  )
}
