"use client";

import "@/styles/globals.css";
import { Inter as FontSans } from 'next/font/google'

import { asyncWithLDProvider } from "launchdarkly-react-client-sdk";
import type { AppProps } from "next/app";
import NoSSRWrapper from "@/components/ui/no-ssr";
import { SessionProvider } from "next-auth/react"

const fontSans = FontSans({ subsets: ['latin'], variable: "--font-sans", })

let c;

if (typeof window !== "undefined") {
  const LDProvider = await asyncWithLDProvider({
    clientSideID: process.env.NEXT_PUBLIC_LD_CLIENT_KEY || "",
    context: {
      kind: "multi",
      user: {
        key: "0",
        name: "anonymous",
        betaModel: false
      },
      device: {
        key: "1234",
        operating_system: "MacOS",
        mobile_device: "False",
      },
    },
  });

  c = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
    return (
      
      <NoSSRWrapper>
     
        <SessionProvider session={session}>
        <LDProvider>
          <main className={`${fontSans.variable} font-sans`}>
          <Component {...pageProps} />
          </main>
        </LDProvider>
        </SessionProvider>
 
      </NoSSRWrapper>
      
    );
  };
} else {
  c = () => null;
}

export default c;
