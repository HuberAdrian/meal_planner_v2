import { ClerkProvider } from "@clerk/nextjs";
import { deDE } from "@clerk/localizations";
import type { AppType } from "next/app";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import { api } from "~/utils/api";
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#222629" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple_icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="11uhr11" />
        <title>11uhr11</title>
        <meta name="description" content="Essensplanung & Haushalt" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ClerkProvider
        localization={deDE}
        appearance={{
          variables: {
            colorPrimary: "#86c232",
            colorBackground: "#2b3035",
            colorText: "#ffffff",
            colorTextSecondary: "#9ca3af",
            colorInputBackground: "#353b41",
            colorInputText: "#ffffff",
            colorNeutral: "#ffffff",
            colorDanger: "#f87171",
            borderRadius: "0.75rem",
          },
        }}
      >
        <Component {...pageProps} />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 2500,
            style: {
              background: "#353b41",
              color: "#fff",
              border: "1px solid #3d444b",
              marginTop: "env(safe-area-inset-top, 0px)",
            },
            success: { iconTheme: { primary: "#86c232", secondary: "#222629" } },
            error: { iconTheme: { primary: "#f87171", secondary: "#222629" } },
          }}
        />
      </ClerkProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
