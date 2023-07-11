import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-cn">
      <head>
        <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="format-detection" content="telephone=no, address=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="记账(开发版)" />
        <meta name="apple-mobile-web-app-orientations" content="portrait-any" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/app-icon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/app-icon.png" />
        <link rel="apple-touch-icon" href="/icons/app-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
