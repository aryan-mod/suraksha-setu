"use client"

import type React from "react"
import { Playfair_Display, Source_Sans_3 as Source_Sans_Pro } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import "@/lib/i18n"
import { Suspense } from "react"
import { LanguageProvider } from "@/components/language-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
  weight: ["400", "700"],
})

const sourceSansPro = Source_Sans_Pro({
  subsets: ["latin"],
  variable: "--font-source-sans-pro",
  weight: ["400", "600", "700"],
})

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${playfairDisplay.variable} ${sourceSansPro.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <LanguageProvider>
              <Suspense fallback={null}>{children}</Suspense>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
        {/* Added global accessibility styles */}
        <style jsx global>{`
          .high-contrast {
            filter: contrast(150%) brightness(110%);
          }
          .reduce-motion * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          [data-focus-visible-added] {
            outline: 2px solid var(--primary) !important;
            outline-offset: 2px !important;
          }
        `}</style>
      </body>
    </html>
  )
}
