if(!self.define){let e,s={};const n=(n,a)=>(n=new URL(n+".js",a).href,s[n]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()})).then((()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(a,t)=>{const i=e||("document"in self?document.currentScript.src:"")||location.href;if(s[i])return;let c={};const r=e=>n(e,i),f={module:{uri:i},exports:c,require:r};s[i]=Promise.all(a.map((e=>f[e]||r(e)))).then((e=>(t(...e),c)))}}define(["./workbox-07a7b4f2"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/Adrian.png",revision:"43e9359fd6815b3ffd8ab6727a77d415"},{url:"/Benni.png",revision:"7d21655e3f5de3bd5c3bb211cddfe9e5"},{url:"/Vivien.png",revision:"c1317663a1a649c5067fff6e9cebd88e"},{url:"/_next/static/3HVkx4KEBYd-Y3ZZRHpUG/_buildManifest.js",revision:"984446e65e32eff04b504fc94cecb544"},{url:"/_next/static/3HVkx4KEBYd-Y3ZZRHpUG/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/1bfc9850-7d878bc179f58af0.js",revision:"7d878bc179f58af0"},{url:"/_next/static/chunks/252f366e-97525ed1e0a16194.js",revision:"97525ed1e0a16194"},{url:"/_next/static/chunks/545f34e4-c14c646ab38fa8e3.js",revision:"c14c646ab38fa8e3"},{url:"/_next/static/chunks/7779ef99-bcbe6b7c38b2541c.js",revision:"bcbe6b7c38b2541c"},{url:"/_next/static/chunks/949-d83d736e680f9686.js",revision:"d83d736e680f9686"},{url:"/_next/static/chunks/95b64a6e-0f3314b6f39a548e.js",revision:"0f3314b6f39a548e"},{url:"/_next/static/chunks/986-6aa36fd6b60440f6.js",revision:"6aa36fd6b60440f6"},{url:"/_next/static/chunks/framework-3201301ead4edad3.js",revision:"3201301ead4edad3"},{url:"/_next/static/chunks/main-aa3ea5e9c89317ec.js",revision:"aa3ea5e9c89317ec"},{url:"/_next/static/chunks/pages/_app-ec9f6f0062dffeee.js",revision:"ec9f6f0062dffeee"},{url:"/_next/static/chunks/pages/_error-54de1933a164a1ff.js",revision:"54de1933a164a1ff"},{url:"/_next/static/chunks/pages/addevent/%5Bdate%5D-075b580940c69af6.js",revision:"075b580940c69af6"},{url:"/_next/static/chunks/pages/addmeal-9b951e4b595b9814.js",revision:"9b951e4b595b9814"},{url:"/_next/static/chunks/pages/deletemeal-8b9278dd4907f673.js",revision:"8b9278dd4907f673"},{url:"/_next/static/chunks/pages/grocerylist-c1ef8df0467204a9.js",revision:"c1ef8df0467204a9"},{url:"/_next/static/chunks/pages/history-7c2406f97fe7e0a8.js",revision:"7c2406f97fe7e0a8"},{url:"/_next/static/chunks/pages/index-1c8f342d0f309849.js",revision:"1c8f342d0f309849"},{url:"/_next/static/chunks/pages/user-profile/%5B%5B...index%5D%5D-98dfd68c4a2d7333.js",revision:"98dfd68c4a2d7333"},{url:"/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",revision:"79330112775102f91e1010318bae2bd3"},{url:"/_next/static/chunks/webpack-35ac0698687d04ff.js",revision:"35ac0698687d04ff"},{url:"/_next/static/css/ffe74b4ce22a972a.css",revision:"ffe74b4ce22a972a"},{url:"/apple-touch-icon.png",revision:"91e908758bd554d4bf5a7d91fb974a11"},{url:"/apple_icon.png",revision:"53b6b8acf97f570cad716df48feb4124"},{url:"/event_default.png",revision:"e285fd2a53c2a9a2f41f654eeef496d1"},{url:"/favicon.ico",revision:"6aa36be635e415eab5d8442614575525"},{url:"/manifest.json",revision:"5bb0bf24379a4acad0d0caccbf3ea6d3"},{url:"/meal_default.png",revision:"5496be773f8cb02ec1bef8acf266619b"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:n,state:a})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
