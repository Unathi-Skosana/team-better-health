import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { MainSidebar } from "@/components/main-sidebar"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "AI EHR Assistant",
  description: "AI-powered Electronic Health Records Assistant",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex h-screen bg-background">
            <MainSidebar />
            <main className="flex-1 overflow-hidden">{children}</main>
          </div>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
