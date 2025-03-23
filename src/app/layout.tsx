import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { brandConfig } from "@/config/brand"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MAO Jewels Admin",
  description: "Jewelry Store Management Admin Panel",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Simplified to avoid hydration issues */}
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
