const path = require('path')
const withPWAInit = require('next-pwa')

// Next.js 13 PWA解决方案
// https://github.com/shadowwalker/next-pwa/issues/424#issuecomment-1332258575

const isDev = process.env.NODE_ENV !== 'production'

const withPWA = withPWAInit({
  dest: 'public',
  disable: isDev,
  exclude: [
    // add buildExcludes here
    ({ asset, compilation }) => {
      if (
        asset.name.startsWith("server/") ||
        asset.name.match(/^((app-|^)build-manifest\.json|react-loadable-manifest\.json)$/)
      ) {
        return true
      }
      if (isDev && !asset.name.startsWith("static/runtime/")) {
        return true
      }
      return false
    }
  ]
})

const generateAppDirEntry = async (entry) => {
  const registerJs = path.join(path.dirname(require.resolve('next-pwa')), "register.js")
  const entries = await entry()
  // Automatically registers the SW and enables certain `next-pwa` features in 
  // App Router (https://github.com/shadowwalker/next-pwa/pull/427)
  if (entries["main-app"] && !entries["main-app"].includes(registerJs)) {
    if (Array.isArray(entries["main-app"])) {
      entries["main-app"].unshift(registerJs)
    } else if (typeof entries["main-app"] === "string") {
      entries["main-app"] = [registerJs, entries["main-app"]]
    }
  }
  return entries
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    const { entry } = config
    config.entry = () => generateAppDirEntry(entry)
    return config
  }
}

module.exports = withPWA(nextConfig)
