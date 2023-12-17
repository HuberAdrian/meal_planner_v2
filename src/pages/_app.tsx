import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { FaCalendar } from "react-icons/fa";

const MyApp: AppType = ({ Component, pageProps }) => {
  return(<ClerkProvider {...pageProps}>
      <Component {...pageProps} />
    </ClerkProvider>)
};

export default api.withTRPC(MyApp);
