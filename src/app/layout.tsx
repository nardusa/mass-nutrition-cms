import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MJ Agency',
  description: 'MJ Agency — manage client websites',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
