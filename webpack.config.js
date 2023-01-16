const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");

const isEnvProduction = process.env.NODE_ENV === "production";
const isEnvDevelopment = !isEnvProduction;
const isEnvProductionProfile =
  isEnvProduction && process.argv.includes("--profile");

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== "false";

const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || "10000"
);

module.exports = {
  mode: "development",
  entry: "./src/index.tsx",
  stats: "errors-warnings",
  bail: isEnvProduction,
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: isEnvProduction
      ? "static/js/[name].js"
      : isEnvDevelopment && "static/js/bundle.js",
    chunkFilename: isEnvProduction
      ? "static/js/[name].chunk.js"
      : isEnvDevelopment && "static/js/[name].chunk.js",
    assetModuleFilename: "static/media/[name][ext]",
  },
  devtool: isEnvProduction
    ? shouldUseSourceMap
      ? "source-map"
      : false
    : isEnvDevelopment && "cheap-module-source-map",
  devServer: {
    open: true,
    static: {
      directory: path.resolve(__dirname, "./build"),
    },
    port: 3000,
  },
  infrastructureLogging: {
    level: "info",
  },
  optimization: {
    minimize: isEnvProduction,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          keep_classnames: isEnvProductionProfile,
          keep_fnames: isEnvProductionProfile,
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
      }),
      new CssMinimizerPlugin(),
    ],
  },
  module: {
    rules: [
      {
        test: cssRegex,
        exclude: cssModuleRegex,
        use: [
          isEnvDevelopment && require.resolve("style-loader"),
          isEnvProduction && {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: require.resolve("css-loader"),
            options: {
              importLoaders: 1,
              sourceMap: isEnvProduction
                ? shouldUseSourceMap
                : isEnvDevelopment,
            },
          },
        ].filter(Boolean),
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp|ico)$/i,
        type: isEnvProduction ? "asset" : "asset/resource",
        parser: {
          dataUrlCondition: {
            maxSize: imageInlineSizeLimit,
          },
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
      {
        test: /\.svg$/,
        type: "asset",
        use: "svgo-loader",
      },
      {
        test: /\.(js|ts)x?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin({
      async: false,
    }),
    new HtmlWebpackPlugin(
      Object.assign(
        {},
        {
          inject: true,
          template: path.resolve(__dirname, "./public/index.html"),
        },
        isEnvProduction
          ? {
              minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
              },
            }
          : undefined
      )
    ),
    isEnvDevelopment &&
      new ReactRefreshWebpackPlugin({
        overlay: false,
      }),
    isEnvProduction &&
      new MiniCssExtractPlugin({
        filename: "static/css/[name].css",
        chunkFilename: "static/css/[name].chunk.css",
      }),
  ].filter(Boolean),
  resolve: {
    modules: ["node_modules"],
    extensions: [".jsx", ".js", ".tsx", ".ts"],
  },
};
