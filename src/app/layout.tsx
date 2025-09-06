import { Geist, Geist_Mono } from "next/font/google"

import "@/app/globals.css"
import { Providers } from "@/components/providers"
import { Metadata } from "next"
import ReduxProvider from "../redux/ReduxProvider"
import { Toaster } from "react-hot-toast"
import { Toaster as SonnerToaster } from "sonner"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "LMS Admin",
  description: "this is an LMS Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>
          <ReduxProvider>
            {children}
          </ReduxProvider>
          <Toaster />
          <SonnerToaster />
        </Providers>
      </body>
    </html>
  )
}
