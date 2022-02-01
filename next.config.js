/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: "/editor",
  //       destination: "https://ohmjs.org/editor/"
  //     },
  //     {
  //       source: "/third_party/:path*",
  //       destination: "https://ohmjs.org/editor/third_party/:path*"
  //     },
  //     {
  //       source: "/style/:path*",
  //       destination: "https://ohmjs.org/editor/style/:path*"
  //     },
  //     {
  //       source: "/assets/:path*",
  //       destination: "https://ohmjs.org/editor/assets/:path*"
  //     }
  //   ];
  // }
}
