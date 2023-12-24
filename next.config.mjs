import { TRPCClientError } from "@trpc/client";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

import WithPWA from 'next-pwa';

const withPWA = WithPWA({
  dest: 'public',
  register: true,
  disable: process.env.NODE_ENV !== 'production',
});

!process.env.SKIP_ENV_VALIDATION && (await import('./src/env.mjs'));


/** @type {import("next").NextConfig} */


const config = withPWA({
  reactStrictMode: true,

  /**
   * If you are using `appDir` then you must comment the below `i18n` config out.
   *
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
});

export default config;


