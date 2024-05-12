import React, { useContext, useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { SessionWallet, PermissionResult, SignedTxn, Wallet } from '../../lib/algorand-session-wallet'
import { platform_settings as ps } from '../../lib/platform-conf'
import { RequestPopupProps, RequestPopup, PopupPermission, DefaultPopupProps } from '../RequestPopup'

export interface FraktionContextType {
  defaultWallet: string;
  sessionWallet: Wallet;
  updateWallet: Function;
  connected: Promise<boolean>;
  popupProps: typeof DefaultPopupProps;
}

export const NavigtionContext = React.createContext<FraktionContextType>({
  //@ts-ignore
  sessionWallet: () => {},
  //@ts-ignore
  updateWallet: () => {},
  //@ts-ignore
  connected: async (): Promise<boolean> => { return false; },
});

export const NavigtionProvider = ({
  children = null,
}: {
  children: JSX.Element | null;
}): JSX.Element => {
  
  const timeout = async(ms: number) => new Promise(res => setTimeout(res, ms));
  const popupCallback = {
    async request(pr: PermissionResult): Promise<SignedTxn[]> {
      let result = PopupPermission.Undecided;
      setPopupProps({isOpen:true, handleOption: (res: PopupPermission)=>{ result = res} })		
      
      async function wait(): Promise<SignedTxn[]> {
        while(result === PopupPermission.Undecided) await timeout(50);

        if(result == PopupPermission.Proceed) return pr.approved()
        return pr.declined()
      }

      //get signed
      const txns = await wait()

      //close popup
      setPopupProps(DefaultPopupProps)

      //return signed
      return txns
    }
  }
  const sw = new SessionWallet(ps.algod.network, popupCallback)
  const [sessionWallet, setSessionWallet] =  useState<any>(sw)
  //@ts-ignore
  const [popupProps, setPopupProps] = useState<any>(DefaultPopupProps)
  const [connected, setConnected] = useState<Promise<boolean>>(sw.connected())
  const updateWallet = async (sw: SessionWallet) => {
    setSessionWallet(sw)
    setConnected(sw.connected())
  };

  const [defaultWallet, setDefaultWallet] = React.useState('')

  useEffect(()=>{ 
      const handleFetchTokens = async () => {
        const defaultAccount = await sessionWallet.getDefaultAccount()
        setDefaultWallet(defaultAccount)
        //console.log("sessionWallet.getDefaultAccount()", defaultAccount)
      }
      if(!sessionWallet.getDefaultAccount()) return 
        handleFetchTokens()
  }, [sessionWallet])

  useEffect(()=> {
    if(!connected) return
      updateWallet(sw);
  },[connected])
  //@ts-ignore

  return (
    <NavigtionContext.Provider
      value={{
        defaultWallet,
        sessionWallet,
        updateWallet,
        //@ts-ignore
        connected,
        popupProps
      }}
    >
      {children}
    </NavigtionContext.Provider>
  );
};

export const useNavigation = () => {
  const {
    defaultWallet,
    sessionWallet,
    updateWallet,
    connected,
    popupProps
  } = useContext(NavigtionContext);
  return {
    defaultWallet,
    sessionWallet,
    updateWallet,
    connected,
    popupProps
  };
};
