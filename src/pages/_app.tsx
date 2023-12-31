import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Head from 'next/head';

const MyApp: AppType = ({ Component, pageProps }) => {
  return(
  <>
  <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#222629" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="11uhr11" />
        <title>Organisation</title>
        <meta name="description" content="Organisationsapp für Vivien" />
        <link rel="icon" href="/favicon.ico" />
    </Head>
  <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
    </ClerkProvider>
    </>)

};

export default api.withTRPC(MyApp);
