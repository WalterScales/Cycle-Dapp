/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import Head from 'next/head'
import {
    Box,
    Button,
    Grid,
    GridItem,
    Center,
    Container,
    Text,
    Stack,
    Link,
    HStack,
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
    TableCaption,
    TableContainer,
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
import GET_REWARDS_BY_ASSET from "../queries/getRewardsByAsset";
import GET_REWARDS_BY_ASSET_FILTER from "../queries/getRewardsByAssetFilter";
import favicon from "../public/favicon.ico";

const PAGE_SIZE=10;
export async function getServerSideProps(context) {
  let page = context.query.page? parseInt(context.query.page) : 1
  //let searchaddress = context.query.address? context.query.address : ''
  let searchaddress = (context.req.cookies['cw'] !== undefined)? context.req.cookies['cw'] : ''
  let asset = context.query.asset? parseInt(context.query.asset) : 0
  let tokenfilter = context.query.token? context.query.token : ''
  //console.log("context", context)
  let offset = (page===1)? 0 : PAGE_SIZE * page
  //const searchaddress = context.query.address? context.query.address : ''
  const { data } = await client.mutate({
    mutation: (tokenfilter !=="")? GET_REWARDS_BY_ASSET_FILTER : GET_REWARDS_BY_ASSET,
    variables: { address: searchaddress, asset_id: asset, first: PAGE_SIZE, offset: offset, tokenfilter: tokenfilter },
  });
  //subscribed = false
  page = page == 0 ? 1 : page - 1;
  //const listingsGood = await Promise.all(listings);
  
  //console.log("nft1", data?.queryWallet[0].stakedassets[0])
  const pageTotal = (data?.queryWallet[0]?.stakedassets[0])? data?.queryWallet[0].stakedassets[0].transactionsAggregate.count / PAGE_SIZE : 0
  const allListings = (data?.queryWallet[0]?.stakedassets[0])? data?.queryWallet[0].stakedassets[0] : []
  //const pageTotal =1
  //@ts-ignore
  return {
        props: {
            listings: allListings,
            curPage: page,
            maxPage: Math.ceil(pageTotal-1)
        }
   }
}
const StakingHistory = (props) => {
  const { listings, curPage, maxPage } = props;
  const nft = (listings)? listings : []
  //console.log("nft2", nft)
  const transactions = (listings)? listings.transactions : []
  const router = useRouter()
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)")
  const tag = undefined
  const filters = new URLSearchParams('')//router.query
  const colSpan = useBreakpointValue({ base: 5, md: 1})
  const [loading, setLoading] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false)
  const [tokenFilter, setTokenFilter] = React.useState()
  const [filtersChanged, setFiltersChanged] = React.useState(true)
  const colorBg = useColorModeValue('gray.400', 'gray.900')

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
      router.push("/staking-history/?asset="+router.query.asset+"&token="+tokenFilter) 
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
                  <FormLabel>Filter By Token</FormLabel>
                  <Input size='s' defaultValue='' maxW={150} onChange={updateTokenFilter} />
                  <Button colorScheme='yellow' onClick={filterListings}>Filter</Button>
              </HStack>
          </Center>
      </Container>
  ):<Container></Container>

  return (
    <>
      <Head>
      <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
      <title>Staking Rewatrds History - Welcome to the Lab - Earn $CYCLE Rewards</title>
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
                          <Box pl='8' pr='8'><Skeleton startColor='gray.500' endColor='gray.500' isLoaded={loading} width={{ base: '375px', md: '775px'}} height={{ base: '175px', md: '375px'}} /></Box>
                      </GridItem>
                      <GridItem colSpan={colSpan}>
                          <Box pl='8' pr='8'><Skeleton startColor='gray.500' endColor='gray.500' isLoaded={loading} width={{ base: '375px', md: '775px'}} height={{ base: '175px', md: '375px'}} /></Box>
                      </GridItem>
                      <GridItem colSpan={colSpan}>
                          <Box pl='8' pr='8'><Skeleton startColor='gray.500' endColor='gray.500' isLoaded={loading} width={{ base: '375px', md: '775px'}} height={{ base: '175px', md: '375px'}} /></Box>
                      </GridItem>
                  </Grid>
                </Center>
              </>
            ) : (
              <>
               <Box bg={colorBg} margin={3} padding={2} borderWidth='1px' borderRadius='lg'>
                <HStack spacing='24px'>
                <Box w='100px' h='100px'>
                    <Image width={150} height={150} src={nft.image != null ? NFT.resolveUrl(nft.image, nft.reserve) : '/placeholder.png' as any} alt='Staking' />
                </Box>
                {nft.name ? (
                    <>
                    <Box w='350px' h='100px'>
                        <Text fontWeight='bold'>ASA: {nft.asset_id}</Text>
                        <Text fontWeight='bold'>UNITNAME: {nft.unitname}</Text>
                        <Text fontSize='xs' noOfLines={1}>{nft.name}</Text>
                    </Box>
                    </>
                ) : (<></>)}
                </HStack>
                <Center>
                    <Text fontSize='xl'>Rewards History</Text>
                </Center>
                {/* <Box>
                    {priceFilter}
                </Box> */}
                    <Table display='block' maxWidth='100%' variant='striped' colorScheme='blue' size='sm' overflowX='auto'>
                    <Thead>
                    <Tr>
                        <Th>Date</Th>
                        <Th>UnitName</Th>
                        <Th>Paid</Th>
                        <Th>Transaction</Th>
                    </Tr>
                    </Thead>
                    <Tbody>
                        {transactions?.length > 0 ? (
                            <>
                            {transactions.map((transaction) => (
                                <Tr key={transaction.id}>
                                    <Td width='20%' fontSize='xs'>{formatDate(transaction.createdat)}</Td>
                                    <Td fontSize='xs'>{transaction.tokenunit}</Td>
                                    <Td fontSize='xs'>{transaction.amountpaid}</Td>
                                    <Td width='80%'>
                                        <Link href={'https://allo.info/tx/'+transaction.txid} isExternal>
                                            <Text fontSize='xs'>{(isLargerThan768) ?  transaction.txid : transaction.txid.substr(0,9) + '...'}</Text>
                                        </Link>
                                    </Td>
                                </Tr>
                            ))}
                            </>
                        ) : (
                            <Tr>
                                <Td>-</Td>
                                <Td>-</Td>
                                <Td>-</Td>
                                <Td>No Transactions Found</Td>
                            </Tr>
                        )}
                    </Tbody>
                    {transactions?.length > 5 ? (
                        <Tfoot>
                        <Tr>
                            <Th>Date</Th>
                            <Th>UnitName</Th>
                            <Th isNumeric>Paid</Th>
                            <Th>Transaction</Th>
                        </Tr>
                        </Tfoot>
                    ) : (
                        <Tfoot></Tfoot>
                    )}
                    </Table>
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

export default StakingHistory