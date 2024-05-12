import Head from 'next/head'
import {
  Box,
  Heading,
  Container, 
  VStack,
  Center,
  Fade,
  Grid, 
  GridItem,
  useMediaQuery,
  useColorModeValue,
  useBreakpointValue,
  Spinner,
  Text
} from '@chakra-ui/react'
import Link from 'next/link'
import * as React from 'react'
import { useState } from 'react'
import Navigation from '../components/Navigation'
import { useNavigation } from "../src/contexts/navigation.context"
import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
import { platform_settings as ps } from '../lib/platform-conf'
import { useMutation } from "@apollo/client"
import { INSERT_UPDATE_WHITELIST } from "../queries/insertUpdateWhitelist"
import favicon from "../public/favicon.ico"
import AdminForm from "../components/forms/admin-form"

export default function AdminWhitelist(props) {
  const [addWhitelist] = useMutation(INSERT_UPDATE_WHITELIST)
  const { defaultWallet, sessionWallet, connected, updateWallet } = useNavigation()
  const colorText = useColorModeValue('black', 'black')
  
  const [data, setData] = useState<{
    assetId: string;
    name: string;
    image: string;
    unitname: string;
    description: string;
    collection_id: string;
    reserve: string;
    website: string;
  }>();
  
  
  React.useEffect(()=>{ 
    if(data === undefined || !connected) return 
    //console.log("form data sent", data)
    var now = new Date().toISOString();
    const insertData = { 
        whitelist: {
            asset_id: parseInt(data.assetId),
            name: data.name,
            image: data.image,
            unitname: data.unitname,
            description: data.description,
            collection_id: data.collection_id,
            website: data.website,
            reserve: data.reserve,
            qty: 1, 
            verified: true
        }
    }
    addWhitelist({
        //@ts-ignore
        variables: insertData,
    }).then(() => {
        console.log("new whitelist created")
    })
    
  }, [addWhitelist, connected, data])

  if (connected && ps.application.admin_addr !== defaultWallet && ps.application.admin_addr2 !== defaultWallet) {
    return (
      <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>Admin - BlockCycle Whitelist Staking NFTs</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" h="90vh" centerContent>
        <Center h="100%">
          <VStack spacing={8}>
            <Heading color={colorText} as="h3" size="xl">
             Access Denied
            </Heading>
            <Text as="cite" color={colorText}>
              Powered by{" "}
              <Link href="https://www.flippingalgos.xyz/">
                FlippingAlgos
              </Link>
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
        <title>Admin - BlockCycle Whitelist Staking NFTs</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" h="90vh" centerContent>
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
              <Link href="https://www.flippingalgos.xyz/">
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
      <title>Admin - BlockCycle Whitelist Staking NFTs</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" centerContent>
          <Box padding="2">
              <Fade in={!data} unmountOnExit>
                <Heading color={colorText} textAlign="center">
                    Add New Whitelist 🐱‍👓
                </Heading>
                <AdminForm onRegistered={setData} />
              </Fade>
              <Fade in={!!data} unmountOnExit>
                <Box maxWidth={"xl"}>
                    <Heading textAlign="center">Success 🙌</Heading>
                    <Box height="2rem"></Box>
                    <Text>
                    Whitelist for the Asset ID{" "}
                    <Text
                        as="span"
                        display="inline"
                        fontWeight="bold"
                        color="blue.600"
                    >
                        {data?.assetId}
                    </Text>{" "}
                    was created!!{" "}
                    </Text>
                </Box>
              </Fade>
            </Box>
      </Container>
    </>
  )
}
