import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mass Nutrition CMS',
  description: 'Agency CMS — manage client websites',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
