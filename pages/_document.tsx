import { Html, Head, Main, NextScript } from 'next/document'
import { fontSans } from '@/lib/fonts';
import { cn } from "@/lib/utils"

export default function Document() {

  
  
  return (
    <Html lang="en">
      <Head />
      <body className={cn(
            "dark bg-background font-sans antialiased",
            fontSans.variable
          )}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
