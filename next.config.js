const withPWANext13 = require('./pwa')

const isDev = process.env.NODE_ENV !== 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = isDev ? nextConfig : withPWANext13(nextConfig)
