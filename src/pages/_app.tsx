import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { FaCalendar } from "react-icons/fa";

const MyApp: AppType = ({ Component, pageProps }) => {
  return(<ClerkProvider {...pageProps}>
      <Component {...pageProps} />;
    </ClerkProvider>)
};

export default api.withTRPC(MyApp);

// I build an app using Next.js, tRCP and TailwindCSS. The ap is a personal project to plan and organize meals and events in a Calendar. Now I want to add an input form where new meals can be safed. I've attached an image on how the page should look like. Give me the code for this page. Use the same technologies as I mentioned. Don't use any other libraries. The code should be clean and easy to read. 