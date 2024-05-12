import Head from 'next/head'
import {
    Box,
    Button,
    Grid,
    GridItem,
    Center,
    Container,
    Text,
    VStack,
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
    Stat,
    StatGroup,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    TableCaption,
    TableContainer,
    Skeleton,
    Spinner,
    useMediaQuery,
    useColorModeValue,
    useBreakpointValue
  } from "@chakra-ui/react"
import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons'
import NextLink from 'next/link'
import * as React from 'react'
import { useState } from 'react'
import ReactPaginate from "react-paginate"
import Navigation from '../components/Navigation'
import Router, { useRouter } from "next/router" 
import { useNavigation } from "../src/contexts/navigation.context"
import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
import { platform_settings as ps } from '../lib/platform-conf'
import client from "../lib/apollo"
import GET_STATS from "../queries/getStats"
import favicon from "../public/favicon.ico"

const PAGE_SIZE=10;
export async function getServerSideProps(context) {
  let page = context.query.page? parseInt(context.query.page) : 1
  let tokenfilter = context.query.token? context.query.token : ''
  let offset = (page===1)? 0 : PAGE_SIZE * (page-1)
  const { data } = await client.mutate({
    mutation: (tokenfilter !=="")? GET_STATS : GET_STATS,
    variables: { first: PAGE_SIZE, offset: offset },
  });
  page = page == 0 ? 1 : page - 1;
  //console.log(data)
  const pageTotal = (data?.aggregateWallet)? data?.aggregateWallet.count / PAGE_SIZE : 0
  return {
    props: {
      //@ts-ignore
      listings: data?.queryWallet,
      curPage: page,
      maxPage: Math.ceil(pageTotal)
    }
  }
}

export default function Admin(props) {
  const { curPage, maxPage, listings } = props
  const router = useRouter()
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)")
  const colSpan = useBreakpointValue({ base: 5, md: 1})
  const { defaultWallet, sessionWallet, connected, updateWallet } = useNavigation()
  const [loading, setLoading] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)
  const colorText = useColorModeValue('black', 'black')
  const boxWidth = useBreakpointValue({ base: '100%', md: '100%'})
  const colorYellowText = useColorModeValue('#85851e', 'yellow')
  const colorGreenText = useColorModeValue('#1e7d48', 'green.300')
  
  //console.log("listings", listings)
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

  if (connected && ps.application.admin_addr !== defaultWallet && ps.application.admin_addr2 !== defaultWallet) {
    return (
      <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>Admin - BlockCycle Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" centerContent>
        <Center h="100%">
          <VStack spacing={8}>
            <Heading color={colorText} as="h3" size="xl">
             Access Denied
            </Heading>
            <Text as="cite" color={colorText}>
              Powered by{" "}
              <NextLink href="https://www.flippingalgos.xyz/">
                FlippingAlgos
              </NextLink>
            </Text>
          </VStack>
        </Center>
      </Container>
    </>
    );
  }
  if (!connected) {
    return (
      <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>Admin - BlockCycle Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" centerContent>
        <Center h="100%">
          <VStack spacing={8}>
            <Heading color={colorText} as="h3" size="xl">
              Connect your Wallet
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
              <NextLink href="https://www.flippingalgos.xyz/">
                FlippingAlgos
              </NextLink>
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
      <title>Admin - BlockCycle Dashboard</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" centerContent>
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
                          <Box pl='8' pr='8'><Skeleton startColor='red.500' endColor='black.500' isLoaded={loading} width={{ base: '375px', md: '775px'}} height={{ base: '175px', md: '375px'}} /></Box>
                      </GridItem>
                      <GridItem colSpan={colSpan}>
                          <Box pl='8' pr='8'><Skeleton startColor='red.500' endColor='black.500' isLoaded={loading} width={{ base: '375px', md: '775px'}} height={{ base: '175px', md: '375px'}} /></Box>
                      </GridItem>
                      <GridItem colSpan={colSpan}>
                          <Box pl='8' pr='8'><Skeleton startColor='red.500' endColor='black.500' isLoaded={loading} width={{ base: '375px', md: '775px'}} height={{ base: '175px', md: '375px'}} /></Box>
                      </GridItem>
                  </Grid>
                </Center>
              </>
            ) : (
              <>
          <Box padding="2">
                <Heading color={colorText} textAlign="center">
                    Dashboard
                </Heading>
                <Box w={boxWidth} mt='3' mb='3'>
                  <HStack>
                  <Center>
                    <NextLink href={'/admin-whitelist'} as={'/admin-whitelist'} passHref>
                      <a><Button>
                            <Text px={2} zIndex={1}>Add NFT</Text>
                        </Button></a>
                    </NextLink>
                  </Center>
                  </HStack>
                </Box>
                <Center>
                    <Text p={2} color={colorText} fontSize='xl'>Active Staked Wallets</Text>
                </Center>
                <Box bg='black'>
                <Table display='block' width="100%" maxWidth='100%' variant='striped' colorScheme='blue' size='sm' overflowX='auto'>
                    <Thead>
                    <Tr>
                        <Th fontFamily={"BankGothicMedium"}>Wallet Address</Th>
                        <Th fontFamily={"BankGothicMedium"}>Total Assets Staked</Th>
                        <Th fontFamily={"BankGothicMedium"}>Staking Pool Name</Th>
                        <Th fontFamily={"BankGothicMedium"}>Staking Balance</Th>
                        <Th fontFamily={"BankGothicMedium"}>Verified</Th>
                    </Tr>
                    </Thead>
                    <Tbody>
                        {listings.length > 0 ? (
                            <>
                            {listings.map((wallet) => (
                                <Tr key={wallet.id}>
                                    <Td width="40%">
                                        <Link href={'https://allo.info/address/'+wallet.address} isExternal>
                                            <Text fontSize='xs'>{(isLargerThan768) ?  wallet.address : wallet.address.substr(0,9) + '...'}</Text>
                                        </Link>
                                    </Td>
                                    <Td width="10%" fontFamily={"BankGothicMedium"} fontSize='xs'>{wallet.stakedassetsAggregate.count}</Td>
                                    <Td width="20%" fontFamily={"BankGothicMedium"} fontSize='xs' align='left'>
                                      <VStack alignItems={'left'}>
                                      {wallet.stakedassets.map((stakedasa) => (
                                          <Text key={stakedasa.id}>
                                              {stakedasa.name}
                                          </Text>
                                      ))}
                                      </VStack>
                                    </Td>
                                    <Td width="20%" fontSize='xs' align='left'>
                                      <VStack alignItems={'left'}>
                                      {wallet.stakedassets.map((stakedasa) => (
                                          <Text color={colorYellowText} key={stakedasa.id}>
                                              {stakedasa.amountstaked}
                                          </Text>
                                      ))}
                                      </VStack>
                                    </Td>
                                    <Td width="10%" fontSize='xs' align='left'>
                                      <VStack alignItems={'left'}>
                                      {wallet.stakedassets.map((stakedasa) => (
                                          <Text color={colorGreenText} key={stakedasa.id}>
                                              {(stakedasa.verified)? "Verified" : null}
                                          </Text>
                                      ))}
                                      </VStack>
                                    </Td>
                                </Tr>
                            ))}
                            </>
                        ) : (
                            <Tr>
                                <Td>-</Td>
                                <Td>-</Td>
                                <Td>-</Td>
                                <Td>-</Td>
                                <Td>No Wallets Found</Td>
                            </Tr>
                        )}
                    </Tbody>
                    </Table> 
                </Box>
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
      </Container>
    </>
  )
}
