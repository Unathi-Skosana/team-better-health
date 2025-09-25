import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "../globals.css"
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
  <>
          <div className="flex h-screen bg-background">
            <MainSidebar />
            <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
          </div>
        </>
  )
}

