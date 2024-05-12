/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import Head from 'next/head'
import {
    Avatar,
    Box,
    Button,
    Grid,
    GridItem,
    Center,
    Container,
    Text,
    Stack,
    Flex,
    Link,
    HStack,
    VStack,
    Input,
    FormLabel,
    Table,
    Thead,
    Tbody,
    Heading,
    Tr,
    Th,
    Td,
    Tfoot,
    Tooltip,
    TableCaption,
    TableContainer,
    Wrap,
    WrapItem,
    Skeleton,
    Spinner,
    useMediaQuery,
    useColorModeValue,
    useBreakpointValue
  } from "@chakra-ui/react";
import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons';
import Image from 'next/image'
import Router, { useRouter } from "next/router" 
import {NFT} from '../lib/nft'
import Navigation from '../components/Navigation'
import ReactPaginate from "react-paginate"
import client from "../lib/apollo";
import GET_TOKENS from "../queries/getTokens";
import GET_TOKENS_FILTER from "../queries/getTokensFilter";
import favicon from "../public/favicon.ico";

const PAGE_SIZE=8;
export async function getServerSideProps(context) {
  let page = context.query.page? parseInt(context.query.page) : 1
  let asa = context.query.asa? parseInt(context.query.asa) : 0
  //console.log("context", context)
  //console.log("asset", asset)
  let offset = (page===1)? 0 : PAGE_SIZE * page
  const { data } = await client.query({
    query: (asa > 0)? GET_TOKENS_FILTER : GET_TOKENS,
    variables: { asset_id: asa, first: PAGE_SIZE, offset: offset },
  });
  page = page == 0 ? 1 : page - 1;
  //const slicedPosts = posts.slice(Number(page)*Number(pagesize), (Number(page)+1)*Number(pagesize));
  //const slicedPosts = listings.slice(offset, offset + pageSize);
  const pageTotal = (data.aggregateWhitelist)? data.aggregateWhitelist.count / PAGE_SIZE : 0
  //const pageTotal = 5
  //console.log("datadata", data)

  //@ts-ignore
  return {
        props: {
            listings: data?.queryWhitelist,
            validTokens: data?.queryTokens,
            totalAssetCount: data?.aggregateStakedAssets.count,
            curPage: page,
            maxPage: Math.ceil(pageTotal-1)
        }
   }
}
const Checknft = (props) => {
  const { listings, validTokens, totalAssetCount, curPage, maxPage } = props;
  const nfts = (listings)? listings : []
  const router = useRouter()
  //const [isLargerThan768] = useMediaQuery("(min-width: 768px)")
  const tag = undefined
  const filters = new URLSearchParams('')//router.query
  const colSpan = useBreakpointValue({ base: 1, md: 1})
  const [loading, setLoading] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)
  //console.log("TRANS", nfts)
  const [tokenFilter, setTokenFilter] = React.useState()
  const [filtersChanged, setFiltersChanged] = React.useState(true)
  const colorBg = useColorModeValue('gray.900', 'gray.900')
  const colorRewardBg = useColorModeValue('gray.500', 'gray.500')

  React.useEffect(()=>{
      if(loaded) return 
      if(listings || filtersChanged)
          setLoaded(true)
          setFiltersChanged(false)
          setLoading(true) 
      return ()=>{}
  }, [loaded, listings, filtersChanged])

  function updateTokenFilter(val){ setTokenFilter(val.target.value.toUpperCase()) }

  // Only allow filtering by price if no tag is chosen
  function filterListings() { 
      router.push("/checknft/?asa="+tokenFilter) 
      setLoaded(false)
      setFiltersChanged(true)
  } 
  
  const formatDate = (sourceDate: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: "long", day: 'numeric', year: 'numeric', hour: '2-digit', minute: "2-digit" };
    return new Intl.DateTimeFormat("en-US", options).format(new Date(sourceDate));
  }
  
  // Triggers fetch for new page
  const handlePagination = page => {
    const path = router.pathname
    const query = router.query
    query.page = page.selected + 1
    router.push({
      pathname: path,
      query: query,
    })
  }
  const priceFilter = tag===undefined?(
      <Container p={2} maxW='container.xl'>
          <Center>
              <HStack>
                  <FormLabel>Search Eligible NFTs by ASA #</FormLabel>
                  <Input size='s' defaultValue='' maxW={150} onChange={updateTokenFilter} />
                  <Button colorScheme='blue' size='sm' onClick={filterListings}>Search</Button>
              </HStack>
          </Center>
      </Container>
  ):<Container></Container>

  return (
    <>
      <Head>
      <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
      <title>Search NFT Eligibility - Welcome to the Lab - Earn $CYCLE Rewards</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Box w="100%" h="100%">
           {!loading ? (
              <>
                <Center>
                    <Text fontSize='xl'>Loading...</Text>
                </Center>
                <Center>
                <Grid
                      templateRows="repeat(2, 1fr)"
                      templateColumns="repeat(1, 1fr)"
                      gap={5}
                      px={{ base: 0, md: 5}}
                      mt={{ base: 0, md: 5}}
                  > 
                      <GridItem colSpan={colSpan}>
                          <Box pl='8' pr='8'><Skeleton startColor='gray.500' endColor='blue.500' isLoaded={loading} width={{ base: '375px', md: '775px'}} height={{ base: '175px', md: '375px'}} /></Box>
                      </GridItem>
                      <GridItem colSpan={colSpan}>
                          <Box pl='8' pr='8'><Skeleton startColor='gray.500' endColor='blue.500' isLoaded={loading} width={{ base: '375px', md: '775px'}} height={{ base: '175px', md: '375px'}} /></Box>
                      </GridItem>
                      <GridItem colSpan={colSpan}>
                          <Box pl='8' pr='8'><Skeleton startColor='gray.500' endColor='blue.500' isLoaded={loading} width={{ base: '375px', md: '775px'}} height={{ base: '175px', md: '375px'}} /></Box>
                      </GridItem>
                  </Grid>
                </Center>
              </>
            ) : (
              <>
               <Box bg={colorBg} margin={3} padding={2} borderWidth='1px' borderRadius='lg'>
                <Center>
                    <Text fontSize='xl'>Search NFT Eligibility</Text>
                </Center>
                <Box>
                    {priceFilter}
                </Box>
                <Grid
                    templateRows="repeat(1, 1fr)"
                    templateColumns="repeat(1, 1fr)"
                    gap={4}
                    px={{ base: 0, md: 4}}
                    mt={{ base: 0, md: 4}}
                > 
                    {nfts.length > 0 ? (
                        <>
                        {nfts.map((nft) => (
                            <GridItem key={nft.id}>
                                <Box fontSize='xs'>
                                    <HStack spacing='24px'>
                                        <Box w='175px' h='100%'>
                                        {(nft.mime_type === 'image/gif' || nft.mime_type === 'video/mp4') ? (
                                            <>
                                            <video autoPlay={true} src={nft && nft.image != '' ? NFT.resolveUrl(nft.image) : '/placeholder.png'}>
                                                <source src={nft && nft.image != '' ? NFT.resolveUrl(nft.image) : '/placeholder.png'} type="video/mp4" />
                                            </video>
                                            </>    
                                        ) : (
                                            <>
                                            <Image width={175} height={175} src={nft.image != null ? NFT.resolveUrl(nft.image, nft.reserve) : '/placeholder.png' as any} alt='NFT Staking' />
                                            </>
                                        )}</Box>
                                        <Box w='100%' h='100%'>
                                            <Text fontWeight='bold'>ASA: <Link href={'https://explorer.perawallet.app/asset/'+nft.asset_id} isExternal>{nft.asset_id}</Link></Text>
                                            <Text fontWeight='bold'>UNITNAME: <Link href={'https://allo.info/asset/'+nft.asset_id} isExternal>{nft.unitname}</Link></Text>
                                            <Text fontSize='xs' noOfLines={1}>{nft.name}</Text>
                                            <Link href={nft.website} isExternal>
                                                    <Text fontSize='xs'>{nft.website}</Text>
                                            </Link>
                                        </Box>
                                    </HStack>
                                    <Box mt={2} p={2} width='100%' bg={colorRewardBg} borderRadius='md'>
                                        <Text fontSize='xs' fontWeight='bold' pb={2} noOfLines={1}>Rewards NFT Earns</Text>
                                        <Wrap spacing='15px'>
                                        {props.validTokens.length > 0 ? (
                                            <>
                                            {props.validTokens.filter(coin => coin.collection_id === nft.collection_id).map((token) => (
                                                <WrapItem key={token.asset_id}>
                                                    <Stack direction={'row'} >
                                                        <Tooltip hasArrow label={(token.name !== null)? token.name : ''} aria-label='Tooltip'>
                                                            <Link href={'https://explorer.perawallet.app/asset/'+token.asset_id} isExternal><Text fontSize='sm'>{token.unitname}</Text></Link>
                                                        </Tooltip>
                                                        {token.frequency !== "" ? (
                                                            <Tooltip hasArrow label={(token.frequency !== null)? 'paid ' + token.frequency + ' Est: ' + token.maxamount : null} aria-label='Tooltip'>
                                                            <Avatar name={token.frequency} size='xs' /></Tooltip>
                                                        ) : (<></>)}
                                                    </Stack>
                                                </WrapItem>
                                            ))}
                                            </>
                                        ) : (
                                            <><WrapItem><Text>No Tokens Found</Text></WrapItem></>
                                        )}
                                        </Wrap>
                                    </Box>
                                </Box>
                                
                            </GridItem>
                        ))}
                        </>
                    ) : (
                    <GridItem>
                        <Text>No Eligibile NFTs Found</Text>
                    </GridItem>
                    )}
                 </Grid>
               </Box>
                <Container centerContent={true} p={3} h={{ base: 35}}>
                    <ReactPaginate
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        previousLabel={(maxPage === 0)? '' : <ArrowLeftIcon />}
                        nextLabel={(maxPage === 0)? '' : <ArrowRightIcon />}
                        breakLabel={"..."}
                        initialPage={curPage}
                        pageCount={maxPage}
                        onPageChange={handlePagination}
                        containerClassName={"paginate-wrap"}
                        pageClassName={"paginate-li"}
                        pageLinkClassName={"paginate-a"}
                        activeClassName={"paginate-active"}
                        nextLinkClassName={"paginate-next-a"}
                        previousLinkClassName={"paginate-prev-a"}
                        breakLinkClassName={"paginate-break-a"}
                    />
                </Container>
             </>
          )}
      </Box>
    </>
  )
}

export default Checknft