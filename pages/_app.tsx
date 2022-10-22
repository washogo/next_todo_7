import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { RecoilRoot } from "recoil";
import { AppContextProvider } from "../context/appContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AppContextProvider>
      <RecoilRoot>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </RecoilRoot>
    </AppContextProvider>
  );
}

export default MyApp;
