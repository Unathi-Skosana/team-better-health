import type React from "react"
import type { Metadata } from "next"
import "../globals.css"


export const metadata: Metadata = {
  title: "Book Appointment - Medical Practice",
  description: "Schedule your medical appointment with our professional healthcare team",
}

export default function BookingLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
          {children}
    </>
  )
}
