import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{
    remotePatterns:[
      {
        hostname: "localhost"
      },
       {
        hostname: "taifur.fablura.com"
      }
    ]
  }
};

export default nextConfig;
