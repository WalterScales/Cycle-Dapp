import Link from 'next/link'
import * as React from 'react'
import {
    Box,
    Flex,
    Image,
    HStack,
    IconButton,
    Button,
    Menu,
    MenuItem,
    MenuButton,
    MenuList,
    MenuDivider,
    useDisclosure,
    useColorModeValue,
    useMediaQuery,
    useColorMode,
    Text,
    Stack,
  } from '@chakra-ui/react';
  import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon, TriangleDownIcon } from '@chakra-ui/icons';
  import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
  import { RequestPopup } from '../src/RequestPopup'
  import { platform_settings as ps } from '../lib/platform-conf'
  import Logo from "../src/img/logo.svg";
  import { useNavigation } from "../src/contexts/navigation.context";

  //const timeout = async(ms: number) => new Promise(res => setTimeout(res, ms));
  export default function Navigation() {
      
  const { defaultWallet, sessionWallet, connected, updateWallet, popupProps } = useNavigation();
  const [ isLargerThan768 ] = useMediaQuery("(min-width: 768px)")
  const { colorMode, toggleColorMode } = useColorMode();
  //@ts-ignore
  //const acct = sessionWallet.getDefaultAccount()
  
  const { isOpen, onOpen, onClose } = useDisclosure();

    return (
      <>
        <Box bg={'#000000'} px={{ base: 1, md: 4}}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon color={'#efefef'} /> : <HamburgerIcon color={'#efefef'} />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={{ base: 4, md: 8}} alignItems={'center'}>
            <Box w={'100%'}><Link href="/" as="/"><a><Logo alt="BlockCycle NFT Staking" /></a></Link></Box>
            <HStack
              as={'nav'}
              spacing={4}
              width={'100%'}
              display={{ base: 'none', md: 'flex' }}>
              <Text fontFamily={'Abel'} fontWeight={'bold'}><Link href="/" as="/">Staking</Link></Text>
              <Text fontFamily={'Abel'} fontWeight={'bold'}><Link href="/checknft" as="/checknft">Check NFT Eligibility</Link></Text>
              {connected && ( defaultWallet == ps.application.admin_addr || defaultWallet == ps.application.admin_addr2) ? (<Text fontFamily={'Abel'} fontWeight={'bold'}><Link href="/admin" as="/admin">Admin</Link></Text>) : null}
            </HStack>
          </HStack>
          <Flex alignItems={'left'}>
            <Stack direction={'row'} spacing={{ base: 2, md: 7}}>
             {/*  <Button p={1} onClick={toggleColorMode}>
                  {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button> */}
              {isLargerThan768 ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded={'full'}
                    variant={'link'}
                    cursor={'pointer'}
                    minW={0}>
                    <TriangleDownIcon color={'#efefef'} boxSize={6}/>
                  </MenuButton>
                  <MenuList>
                    <AlgorandWalletConnector 
                          darkMode={true}
                          //@ts-ignore
                          sessionWallet={sessionWallet}
                          connected={connected} 
                          //@ts-ignore
                          updateWallet={updateWallet}
                          />
                    <MenuDivider />
                    <Link href={'/checknft'} as={'/checknft'} passHref><MenuItem fontFamily={'Abel'}>Check NFT Eligibility</MenuItem></Link>
                    {/* {connected ? (<Link href={'/summary?address='+ acct} as={'/summary?address='+ acct} passHref><MenuItem>My Rewards Summary</MenuItem></Link>) : ''} */}
                  </MenuList>
                </Menu>
              ) : null}
            </Stack>
            </Flex>
        </Flex>
    
        {isOpen ? (
          <Box pl={1} pr={1} pb={2} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={{ base: 2, md: 4}}>
              <AlgorandWalletConnector 
                    darkMode={true}
                    //@ts-ignore
                    sessionWallet={sessionWallet}
                    connected={connected} 
                    //@ts-ignore
                    updateWallet={updateWallet}
                    />
              <Link href="/checknft" as="/checknft">Check NFT Eligibility</Link>
              {connected ? (<Link href="/" as="/">NFT Staking</Link>) : ''}
              {/* {connected ? (<Link href={'/summary?address='+ acct} as={'/summary?address='+ acct} passHref>My Rewards Summary</Link>) : ''} */}
              {connected && (defaultWallet == ps.application.admin_addr|| defaultWallet == ps.application.admin_addr2) ? (<Link href="/admin" as="/admin">admin</Link>) : ''}
            </Stack>
          </Box>
        ) : null}
      </Box>
      {
        //@ts-ignore
      }
      <RequestPopup 
      //@ts-ignore 
      {...popupProps}/>
      </>
    )
}
