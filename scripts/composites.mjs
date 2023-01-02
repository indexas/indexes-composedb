import { readFileSync } from 'fs';
import { CeramicClient } from '@ceramicnetwork/http-client'
import {
  createComposite,
  readEncodedComposite,
  writeEncodedComposite,
  writeEncodedCompositeRuntime,
} from "@composedb/devtools-node";

import { DID } from 'dids';
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import { fromString } from "uint8arrays/from-string";

/// Start importing for lit signer
import {
  encodeDIDWithLit,
  Secp256k1ProviderWithLit,
} from "../key-did-provider-secp256k1-with-lit";

/// End importing for lit signer


const ceramic = new CeramicClient("http://localhost:7007");

/**
 * @param {Ora} spinner - to provide progress status.
 * @return {Promise<void>} - return void when composite finishes deploying.
 */
export const writeComposite = async (spinner) => {
  await authenticate()
  spinner.info("writing composite to Ceramic")
  const composite = await createComposite(ceramic, './composites/basicProfile.graphql')
  await writeEncodedComposite(composite, "./src/__generated__/definition.json");
  spinner.info('creating composite for runtime usage')
  await writeEncodedCompositeRuntime(
    ceramic,
    "./src/__generated__/definition.json",
    "./src/__generated__/definition.js"
  );
  spinner.info('deploying composite')
  const deployComposite = await readEncodedComposite(ceramic, './src/__generated__/definition.json')

  await deployComposite.startIndexingOn(ceramic)
  spinner.succeed("composite deployed & ready for use");
}

/**
 * Authenticating DID for publishing composite
 * @return {Promise<void>} - return void when DID is authenticated.
 */
const authenticate = async () => {
  console.log("Ahoy!")
  /*
  const seed = readFileSync('./admin_seed.txt')
  const key = fromString(
    seed,
    "base16"
  );
  const did = new DID({
    resolver: getResolver(),
    provider: new Ed25519Provider(key)
  })
  */
  const encodedDID = await encodeDIDWithLit("0x04f53eaacaf0bbf78fbf1606724e81e55b258aa22342fd94c9ccbaac0b3093e3a37608f96c42189574c94e21c4a101d85f381228ede5808d1c2bb719a1b7c18984");

  const provider = new Secp256k1ProviderWithLit({
    did: encodedDID,
    ipfsId: "Qme9L6jU4CStoBZL7etpwPVX7XPWJ59Z9iFXoTPXyfgXrT",
    pkpPublicKey:
        "0x04f53eaacaf0bbf78fbf1606724e81e55b258aa22342fd94c9ccbaac0b3093e3a37608f96c42189574c94e21c4a101d85f381228ede5808d1c2bb719a1b7c18984",
  });

  const did = new DID({ provider, resolver: getResolver() });

  await did.authenticate()
  ceramic.did = did
}
