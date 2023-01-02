import { DIDSession } from "did-session";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";
import type { CeramicApi } from "@ceramicnetwork/common"
import type { ComposeClient } from "@composedb/client";
import { DID } from "dids";
import { getResolver } from "key-did-resolver";

import {
  encodeDIDWithLit,
  Secp256k1ProviderWithLit,
} from "../key-did-provider-secp256k1-with-lit";


// If you are relying on an injected provider this must be here otherwise you will have a type error.
declare global {
  interface Window {
    ethereum: any;
  }
}

/**
 * Checks localStorage for a stored DID Session. If one is found we authenticate it, otherwise we create a new one.
 * @returns Promise<DID-Session> - The User's authenticated sesion.
 */
export const authenticateCeramic = async (ceramic: CeramicApi, compose: ComposeClient) => {

  const encodedDID = await encodeDIDWithLit("0x04f53eaacaf0bbf78fbf1606724e81e55b258aa22342fd94c9ccbaac0b3093e3a37608f96c42189574c94e21c4a101d85f381228ede5808d1c2bb719a1b7c18984");

  const provider = new Secp256k1ProviderWithLit({
    did: encodedDID,
    ipfsId: "Qme9L6jU4CStoBZL7etpwPVX7XPWJ59Z9iFXoTPXyfgXrT",
    pkpPublicKey:
        "0x04f53eaacaf0bbf78fbf1606724e81e55b258aa22342fd94c9ccbaac0b3093e3a37608f96c42189574c94e21c4a101d85f381228ede5808d1c2bb719a1b7c18984",
  });

  let did = new DID({ provider, resolver: getResolver() });

  // Set our Ceramic DID to be our session DID.
  compose.setDID(did)
  ceramic.did = did
  return
}
