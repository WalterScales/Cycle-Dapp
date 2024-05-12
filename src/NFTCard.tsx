
/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, Avatar, Container, Text, Link, Image, Button, Table, Thead, Tbody, HStack, Center, 
    Modal, 
    ModalOverlay, 
    ModalBody, 
    ModalContent, 
    ModalHeader,
    NumberInput, 
    NumberInputField, 
    NumberInputStepper, 
    NumberIncrementStepper, 
    NumberDecrementStepper, 
    Th, Tr, Td, Tooltip, useColorModeValue, useDisclosure } from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons';
import { NFT } from '../lib/nft'
import { Wallet } from '../lib/algorand-session-wallet'
import { isOptedIntoAsset, sendWait, getSuggested } from '../lib/algorand'
import { Transaction } from 'algosdk'
import { get_asa_optin_txn } from '../lib/transactions'
import { useState, useEffect } from "react"

type NFTCardProps = {
    nft: NFT;
    wallet: Wallet;
    tokenList: any;
    isOptIntoAsset: any;
    totalAssetCount: number;
    setOptIntoAsset: any;
};

export function NFTCard(props: NFTCardProps) {
    //console.log("NFTCard1",props)
    const { tokenList, nft, wallet, isOptIntoAsset, setOptIntoAsset } = props;
    const [isNFTVerified, setNFTVerified] = useState(nft.verified)
    const [isOptIn] = useState(isOptIntoAsset)
    const [nftStakedAmount, setNftStakedAmount] = useState(nft.stakedamount)
    const [tokenWalletBalance, setTokenWalletBalance] = useState(nft.tokenBalance)
    const [isStaking, setIsStaking] = React.useState(false)
    const [qtyValue, setQtyValue] = React.useState((tokenWalletBalance / Math.pow(10, nft.decimals)))
    const [stakeValue, setStakeValue] = React.useState((tokenWalletBalance / Math.pow(10, nft.decimals)))
    const [isUpdatingStake, setIsUpdatingStake] = React.useState(false)
    const [isStakingUpdate, setIsStakingUpdate] = React.useState(false)
    const colorBgModal = useColorModeValue('gray', 'gray.500')
    const greyBG = useColorModeValue('gray.500', 'gray.500')
    const greyBG2 = useColorModeValue('gray.600', 'gray.600')
    const greenTextColor = useColorModeValue('green.600', 'green.400')
    const colorPinkBlue = useColorModeValue('pink', 'blue')
    const colorText = useColorModeValue('white', 'white')
    const colorTextEarned = useColorModeValue('#96be25', '#96be25')
    const colorTextStaked = useColorModeValue('#a4b0e0', '#a4b0e0')
    const { isOpen: isSendOpen, onOpen: onSendOpen, onClose: onSendClose } = useDisclosure()

    async function handleCloseModal() {
        setStakeValue((tokenWalletBalance / Math.pow(10, nft.decimals)))
        onSendClose()
    }

    async function verifyNFT(event) {
        event.stopPropagation()
        event.preventDefault()
        setIsStaking(true)

        const addr = await wallet.getDefaultAccount()
        await nft.verifyToken(wallet).then((res) => {
            if(res) {
                //console.log("verified NFT",res)
                fetch('/api/stakeAsset', {
                    method: 'POST',
                    body: JSON.stringify({
                        address: addr, 
                        name: (nft.metadata.name === undefined)? nft.metadata.description : nft.metadata.name,
                        amountstaked: nft.amount, 
                        image: nft.metadata.image,
                        unitname: nft.unitname,
                        collection_id: nft.collection_id,
                        asset_id: nft.asset_id
                    })
                })
                .then((res) => {
                    res.json().then((getStatus) => {
                        //console.log("nft verified", getStatus)
                        if(getStatus.success) {
                            //showNetworkSuccess("Successfully")
                            setNFTVerified(true)
                        }
                        setIsStaking(false)
                    })
                })
            }
        }).catch((err)=>{ 
            console.log("error verifing NFT", err)
            setIsStaking(false)
        })
    }
    
    async function handleOptIntoAsset(assetId){

        if(wallet === undefined) return 
        const addr = await wallet.getDefaultAccount()

        if(await isOptedIntoAsset(addr, assetId)) return

        const suggested = await getSuggested(10)
        const optin = new Transaction(get_asa_optin_txn(suggested, addr, assetId))

        const [signed] = await wallet.signTxn([optin])

        const result = await sendWait([signed])
        
        if(result !== undefined) {
            setOptIntoAsset([{ asset_id: assetId, optin: false}])
            isOptIn.map((tokenOpt) => {
                if(tokenOpt.asset_id === assetId)
                    tokenOpt.optin = false
            })
           setOptIntoAsset(isOptIn)
            return true
        } else {
            return false
        }
    }
    useEffect(() => {
       setOptIntoAsset(isOptIn)
      }, [isOptIn])
    
      
    async function stakeNFT(event) {
        event.stopPropagation()
        event.preventDefault()
        setIsStaking(true)
        const addr = await wallet.getDefaultAccount()
        await nft.verifyTokenWAlgo(wallet).then((res) => {
            if(res) {
                //console.log("verified",res)
                fetch('/api/stakeAsset', {
                    method: 'POST',
                    body: JSON.stringify({
                        address: addr, 
                        name: (nft.metadata.name === undefined)? nft.metadata.description : nft.metadata.name,
                        amountstaked: qtyValue, 
                        image: nft.metadata.image,
                        unitname: nft.unitname,
                        collection_id: nft.collection_id,
                        asset_id: nft.asset_id
                    })
                })
                .then((res) => {
                    res.json().then((getStatus) => {
                        //console.log("verified", getStatus)
                        if(getStatus.success) {
                            //showNetworkSuccess("Successfully")
                            setNftStakedAmount(qtyValue)
                            setNFTVerified(true)
                            setIsStaking(false)
                        } else {
                            //showErrorToaster("Error")
                            setIsStaking(false)
                        }
                    })
                })
            }
        }).catch((err)=>{ 
            console.log("error staking", err)
            setIsStaking(false)
        })
    }
    
    async function unstakeNFT(event) {
        event.stopPropagation()
        event.preventDefault()
        setIsStaking(true)
        const addr = await wallet.getDefaultAccount()
        await nft.verifyToken(wallet).then((res) => {
            if(res) {
                fetch('/api/unstakeAsset', {
                    method: 'POST',
                    body: JSON.stringify({
                        address: addr, 
                        asset_id: nft.asset_id
                    })
                })
                .then((res) => {
                    res.json().then((getStatus) => {
                        if(getStatus.success) {
                            //showNetworkSuccess("Successfully")
                            setNFTVerified(false)
                            setIsStaking(false)
                        } else {
                            //showErrorToaster("Error")
                            setIsStaking(false)
                        }
                    })
                })
            } 
        }).catch((err)=>{ 
            console.log("error verifing", err)
            setIsStaking(false)
        })
    }

    async function onUpdateStaking(event, nftStakedAmount){

        event.stopPropagation()
        event.preventDefault()
        setIsStakingUpdate(true)
        //const addr = await wallet.getDefaultAccount()
        let diffAmt = 0
        if(nftStakedAmount <= stakeValue) {
            diffAmt = stakeValue - nftStakedAmount
        } else {
            diffAmt = nftStakedAmount - stakeValue
        }
        diffAmt = stakeValue - nftStakedAmount
        //console.log("stakingdiffAmt", diffAmt)
        await nft.verifyToken(wallet).then((res) => {
            if(res) {
                //console.log("verified",res)
                fetch('/api/updateAsset', {
                    method: 'POST',
                    body: JSON.stringify({
                        id: nft.id, 
                        amountstaked: stakeValue
                    })
                })
                .then((res) => {
                    res.json().then((getStatus) => {
                        //console.log("nft verified", getStatus)
                        if(getStatus.success) {
                            //showNetworkSuccess("Successfully")
                            setNftStakedAmount(stakeValue)
                            setNFTVerified(true)
                            setIsStakingUpdate(false)
                            onSendClose()
                        } else {
                            //showErrorToaster("Error")
                            setIsStakingUpdate(false)
                        }
                    })
                })
            }
        }).catch((err)=>{ 
            console.log("error updating staking amount", err)
            setIsStakingUpdate(false)
        })
    }

    return (
        <Box bg={greyBG} margin={4} borderWidth='1px' borderRadius='lg'>
            <Container p={0} bg={greyBG2} borderTopLeftRadius='md' borderTopRightRadius='md' centerContent>
                <Text fontSize='xs' color='white' fontWeight='bold'>{(nft.asset_id === 1691271561) ? 'Stake CYCLE Token' : 'Stake Block Cycle NFTs'}</Text>
            </Container>
            <Container p={0}>
                <Link href={'/history/?asset='+nft.asset_id}>
                {(nft.metadata.mime_type === 'image/gif' || nft.metadata?.image_mimetype === 'video/mp4') ? (
                    <>
                    <video autoPlay={true} src={nft && nft.metadata.image != '' ? NFT.resolveUrl(nft.metadata.image) : '/placeholder.png'}>
                        <source src={nft && nft.metadata.image != '' ? NFT.resolveUrl(nft.metadata.image) : '/placeholder.png'} type="video/mp4" />
                    </video>
                    </>
                ) : (
                    <>
                    <Image alt='NFT Staking' src={nft && nft.metadata.image != '' ? NFT.resolveUrl(nft.metadata.image) : '/placeholder.png'} />
                    </>
                )}
                </Link>
            </Container>
            {nft.asset_id == 1691271561 ? (
                <>
            <Container p={1}>
                <Link href={'https://explorer.flippingalgos.xyz/asset/'+nft.asset_id}>
                <Text fontSize='12px' fontWeight='bold' color={colorText}>{nft.asset_id}</Text>
                </Link>
                <Text fontSize='s' color={colorText} noOfLines={1}>
                  {(nft.metadata.name !== undefined)? nft.metadata.name : null} 
                </Text>
            </Container>
            <Container pt={0} pl={0} pr={0} pb={2} centerContent>
                {isNFTVerified ? (
                    <>
                    <Text fontSize='10px' color={colorText}>Wallet Balance: {(tokenWalletBalance / Math.pow(10, nft.decimals)).toFixed(nft.decimals)}</Text>
                    <Text p={1} fontSize='12px' fontWeight={'bold'} color={colorTextStaked}>Staked: {nftStakedAmount.toFixed(nft.decimals)}</Text>
                    <HStack>
                        <Button size='xs' isLoading={isUpdatingStake} loadingText='Attempting to Update...' spinner={<></>} colorScheme={'green'} onClick={onSendOpen}>Edit Stake</Button>
                        <Modal isCentered isOpen={isSendOpen} size={'xl'} onClose={handleCloseModal}>
                            <ModalOverlay backdropFilter='blur(10px)'/>
                            <ModalContent alignItems='center' bgColor={colorBgModal} borderWidth='1.5px' borderRadius='lg'>
                                <ModalHeader bgClip='text' color='white' fontSize='lg' fontWeight='bold'>Edit Staked Amount</ModalHeader>
                                <ModalBody mb={2}>
                                    <HStack pb={4} spacing='2px' alignItems='center' justifyContent='center'>
                                        <NumberInput isDisabled={isStaking} step={0.001} size='sm' borderColor={colorText} onChange={(value) => setStakeValue(parseFloat(value))} defaultValue={(tokenWalletBalance / Math.pow(10, nft.decimals))} min={0.01} max={(tokenWalletBalance / Math.pow(10, nft.decimals))} w='130px'>
                                            <NumberInputField color={colorText} />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper color={colorText} />
                                                <NumberDecrementStepper color={colorText} />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </HStack>
                                    <HStack mt={6} alignItems='center' justifyContent='center'>
                                        <Button size='sm' onClick={handleCloseModal}>X</Button>
                                        <Button isLoading={isStakingUpdate} onClick={(event) => { onUpdateStaking(event, nftStakedAmount) }} size='sm'>Update</Button>
                                    </HStack>
                                </ModalBody>
                            </ModalContent>
                        </Modal>
                        <Button size='xs' isLoading={isStaking} loadingText='Unstaking...' colorScheme={'green'} onClick={(event) => { unstakeNFT(event) }} >Unstake</Button>
                    </HStack>
                    {tokenList.length > 0 ? (
                        <>
                        <Table variant='striped' colorScheme='gray' size='sm'>
                        <Thead>
                            <Tr>
                                <Th color={'gray.800'}>Status</Th>
                                <Th color={'gray.800'}>Token</Th>
                                <Th color={'gray.800'} isNumeric>Earned</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                        {tokenList.filter(coin => coin.collection_id === nft.collection_id).map((token) => (
                            <Tr key={token.id}>
                                <Td p={{ base: 1, md: 2}}><Center>
                                    {isOptIn.filter(opt => opt.asset_id === token.asset_id).map((tokenOpt) => (
                                        <Box key={tokenOpt.asset_id}>
                                            <HStack>
                                                <Box>
                                                {tokenOpt.optin ? (
                                                    <Button size='xs' colorScheme='blue' onClick={() => { handleOptIntoAsset(token.asset_id) }}>Add Asset</Button>
                                                ) : (
                                                    <CheckCircleIcon color='green.400' boxSize={4} />
                                                )}
                                                </Box>
                                                <Box>
                                                {!tokenOpt.optin && token.frequency !== "" ? (
                                                    <Tooltip hasArrow label={(token.frequency !== null)? 'paid ' + token.frequency : ''} aria-label='Tooltip'><Avatar boxSize={4} name={token.frequency} size='xs' /></Tooltip>
                                                ) : (<></>)}
                                                </Box>
                                            </HStack>
                                        </Box>
                                    ))}
                                </Center></Td>
                                <Td>
                                    <Tooltip hasArrow label={(token.name !== null)? token.name : ''} aria-label='Tooltip'>
                                        <Link href={'https://vestige.fi/asset/'+token.asset_id} isExternal><Text fontSize='sm'>{token.unitname}</Text></Link>
                                    </Tooltip>
                                </Td>
                                <Td isNumeric>
                                {nft.alltokenrewards.filter(tokenReward => tokenReward.token === token.unitname).map(filteredToken => (
                                    <Tooltip key={filteredToken.value} hasArrow label={(token.maxamount !== null)? token.frequency[0].toUpperCase() + token.frequency.slice(1) + ' Est: ' + Math.ceil((nftStakedAmount / props.totalAssetCount) * token.maxamount)  : ''} aria-label='Tooltip' placement='right-end'>
                                        <Text fontSize='sm' color={colorTextEarned}>
                                            {(filteredToken.value > 0)? filteredToken.value.toFixed(3) : '--'}
                                        </Text> 
                                    </Tooltip>
                                ))}
                                </Td>
                            </Tr>
                        ))}
                            </Tbody>
                        </Table>
                        </>
                    ) : (
                        <Text>No Tokens Found</Text>
                    )}
                    </>
                ) : (
                    <>
                    {(tokenWalletBalance / Math.pow(10, nft.decimals) >= 1 ? (
                    <HStack>
                        <NumberInput isDisabled={isStaking} step={0.001} size='sm' borderColor={colorText} onChange={(value) => setQtyValue(parseFloat(value))} defaultValue={(tokenWalletBalance / Math.pow(10, nft.decimals))} min={0.01} max={(tokenWalletBalance / Math.pow(10, nft.decimals))} w='130px'>
                        <NumberInputField color={colorText} />
                        <NumberInputStepper>
                            <NumberIncrementStepper color={colorText} />
                            <NumberDecrementStepper color={colorText} />
                        </NumberInputStepper>
                        </NumberInput>
                        <Button isLoading={isStaking} loadingText='Staking...' spinner={<></>} colorScheme={'green'} onClick={stakeNFT}>Stake</Button>
                    </HStack>
                    ) : (
                    <HStack>
                        <Text color={'yellow'} fontSize='10px'>{(tokenWalletBalance / Math.pow(10, nft.decimals))} is below the Minimum balance of 1 {(nft.metadata.name !== undefined)? nft.metadata.name : null}</Text>
                    </HStack>
                    ) )}
                    </>
                )}
                <Link href={'/history/?asset='+nft.asset_id}>
                    <Text p={1} fontSize='10px' fontWeight='bold' color={colorText}>Reward History</Text>
                </Link>
            </Container>
            </>
            ) : (
                <>
            <Container p={1}>
                <Text color='white' fontSize='12px' fontWeight='bold'>
                    <Link href={'/history/?asset='+nft.asset_id}>{nft.asset_id}</Link></Text>
                <Text color='white' fontSize='s' noOfLines={1}>
                    {(props.nft.metadata.name === undefined)? nft.metadata.description : nft.metadata.name}
                </Text>
            </Container>
            <Container pt={0} pl={0} pr={0} pb={2} centerContent>
                <Table variant='striped' colorScheme='gray' size='sm'>
                    <Thead>
                    <Tr>
                        <Th color={'gray.800'}>Status</Th>
                        <Th color={'gray.800'}>Token</Th>
                        <Th color={'gray.800'} isNumeric>Earned</Th>
                    </Tr>
                    </Thead>
                    <Tbody>
                        {tokenList.length > 0 ? (
                            <>
                            {tokenList.filter(coin => coin.collection_id === nft.collection_id).map((token) => (
                                <Tr key={token.id}>
                                    <Td p={{ base: 1, md: 2}}><Center>
                                    {isOptIn.filter(opt => opt.asset_id === token.asset_id).map((tokenOpt) => (
                                        <Box key={tokenOpt.asset_id}>
                                            <HStack>
                                                <Box>
                                                {tokenOpt.optin ? (
                                                    <Button size='xs' colorScheme='blue' onClick={() => { handleOptIntoAsset(token.asset_id) }}>Add Asset</Button>
                                                ) : (
                                                    <CheckCircleIcon color='green.400' boxSize={4} />
                                                )}
                                                </Box>
                                                {!tokenOpt.optin && token.frequency !== "" ? (
                                                    <Tooltip hasArrow label={(token.frequency !== null)? 'paid ' + token.frequency : ''} aria-label='Tooltip'><Avatar boxSize={4} name={token.frequency} size='xs' /></Tooltip>
                                                ) : (<></>)}
                                            </HStack>
                                        </Box>
                                    ))}
                                    </Center></Td>
                                    <Td>
                                        <Tooltip hasArrow label={(token.name !== null)? token.name : ''} aria-label='Tooltip'>
                                            <Link href={'https://vestige.fi/asset/'+token.asset_id} isExternal><Text fontSize='sm'>{token.unitname}</Text></Link>
                                        </Tooltip>
                                    </Td>
                                    <Td isNumeric>
                                        
                                        {nft?.alltokenrewards?.filter(tokenReward => tokenReward.token === token.unitname).map(filteredToken => (
                                            <Tooltip key={filteredToken.value} hasArrow label={(token.maxamount !== null)? token.frequency[0].toUpperCase() + token.frequency.slice(1) + ' Est: ' + Math.ceil(token.maxamount / props.totalAssetCount) : ''} aria-label='Tooltip' placement='right-end'>
                                                <Text fontSize='md' fontWeight='bold' color={greenTextColor}>
                                                    {(filteredToken.value > 0)? filteredToken.value : '--'}
                                                </Text> 
                                            </Tooltip>
                                        ))}
                                    </Td>
                                </Tr>
                            ))}
                            </>
                        ) : (
                        <><Tr><Td colSpan={3}><Center><Text color='white'>No Tokens Found</Text></Center></Td></Tr></>
                        )}
                    </Tbody>
                </Table>
            </Container>
            <Container p={1} centerContent>
            {isNFTVerified ? (
                <HStack>
                <Button isDisabled={true} colorScheme={colorPinkBlue} size={'xs'}  onClick={verifyNFT}>Staked</Button>
                <Button size='xs' isLoading={isStaking} loadingText='Unstaking...' colorScheme={'green'} onClick={(event) => { unstakeNFT(event) }} >Unstake</Button>
                </HStack>
            ) : (
                <Button isLoading={isStaking} loadingText='Staking...' size={'xs'} colorScheme='blue' onClick={verifyNFT}>Stake</Button>
            )}
            </Container>
            </>
                )}
        </Box> 
    )

}