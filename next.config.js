module.exports = {
  images: {
    domains: ['yieldly.mypinata.cloud','ipfs.algonode.xyz'],
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/(.*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://app.blockcycle.org" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },
  trailingSlash: false,
  reactStrictMode: true,
  crossOrigin: 'anonymous',
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {

    config.module.rules.push({
      test: /\.(ts|tsx)$/i,
      loader: "ts-loader",
      exclude: ["/node_modules/"],
    });
    /* 
  useFileSystemPublicRoutes: true,
  distDir: 'build',
    config.module.rules.push({
      test: /\.(scss|css)$/i,
      use: [
        "style-loader" , "css-loader" , "sass-loader"
     ],
    });

    config.module.rules.push({
      test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif|ico)$/i,
      type: "asset",
    });
 */
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });
    
    config.module.rules.push({
      test: /\.(teal)$/i,
      type: "asset/resource",
      loader: "raw-loader",
    });
    // Important: return the modified config
    return config;
  },
};
