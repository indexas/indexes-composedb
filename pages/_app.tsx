import '../styles/globals.css'

import {CeramicWrapper} from "../context";
import type { AppProps } from 'next/app'
import CeramicProvider from "../context/CeramicProvider";

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <CeramicWrapper>
        <CeramicProvider>
            <Component {...pageProps} ceramic />
        </CeramicProvider>
    </CeramicWrapper>
  );
}

export default MyApp
