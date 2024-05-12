
/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, Center, Text, Link, Image, HStack, Button, Table, Thead, Tbody, Tfoot, Th, Tr, Td, TableContainer, TableCaption, useColorModeValue, useBreakpointValue } from '@chakra-ui/react'
import {NFT} from '../lib/nft'
import { Wallet } from '../lib/algorand-session-wallet'

type NFTListingProps = {
    nft: any;
    wallet: Wallet;
};

export function NFTListing(props: NFTListingProps) {
    //console.log("NFTListing",props)
    const formatDate = (sourceDate: Date) => {
      const options: Intl.DateTimeFormatOptions = { month: "long", day: 'numeric', year: 'numeric', hour: '2-digit', minute: "2-digit" };
      return new Intl.DateTimeFormat("en-US", options).format(new Date(sourceDate));
    }
    return (
        <Box bg={useColorModeValue('gray.400', 'gray.900')} margin={1} borderWidth='1px' borderRadius='lg'>
            <HStack spacing='24px'>
                <Box w='100px' h='100px'>
                    {/*  <Link href={'/nft/'+props.nft.asset_id}> */}
                    <Image boxSize='100px' alt='NFT Staking' src={props.nft && props.nft.metadata.image != '' ? NFT.resolveUrl(props.nft.metadata.image) : 'placeholder.png'} />
                    {/*  </Link> */}
                </Box>
                <Box w='300px' h='100px'>
                    <Text fontWeight='bold'>ASA: {props.nft.asset_id}</Text>
                    <Text fontWeight='bold'>UNITNAME: {props.nft.metadata.unitName}</Text>
                    <Text fontSize='xs'>{(props.nft.metadata.description.length <= 102)? props.nft.metadata.description : props.nft.metadata.description.substr(0, 102) + '...'}</Text>
                </Box>
            </HStack>
            <TableContainer>
            <Table variant='striped' colorScheme='pink' size='sm' overflowX='scroll'>
                <TableCaption placement='top'>Most Recent Transactions</TableCaption>
                <Thead>
                    <Tr>
                        <Th>Date</Th>
                        <Th>UnitName</Th>
                        <Th isNumeric>Paid</Th>
                        <Th>Transaction</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {props.nft.transactions.length > 0 ? (
                        <>
                        {props.nft.transactions.map((transaction) => (
                            <Tr key={transaction.id}>
                                <Td>{formatDate(transaction.createdat)}</Td>
                                <Td>{transaction.tokenunit}</Td>
                                {/* <Td><Link href={'https://vestige.fi/asset/'+transaction.asset_id} isExternal><Text>{transaction.tokenunit}</Text></Link></Td> */}
                                <Td isNumeric>{transaction.amountpaid}</Td>
                                <Td>
                                    <Link href={'https://allo.info/tx/'+transaction.txid} isExternal>
                                        <Text>{transaction.txid}</Text>
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
                <Tfoot>
                    <Tr>
                        <Th></Th>
                        <Th></Th>
                        <Th></Th>
                        <Th><Link href={'/history/?asset='+props.nft.asset_id}>View Full Transaction History</Link></Th>
                    </Tr>
                </Tfoot>
            </Table>
            </TableContainer>
        </Box> 
    )

}