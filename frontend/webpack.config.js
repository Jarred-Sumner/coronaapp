var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const rootDir = path.join(__dirname, '.');
const webpackEnv = process.env.NODE_ENV || 'development';
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

// shim react-navigation missing types by edit code directly
Object.entries({
  DrawerRouter: [
    'DrawerActionType',
    'DrawerNavigationState',
    'DrawerRouterOptions',
  ],
  StackRouter: [
    'StackActionType',
    'StackNavigationState',
    'StackRouterOptions',
  ],
  TabRouter: ['TabActionType', 'TabNavigationState', 'TabRouterOptions'],
}).forEach(([file, types]) => {
  const filePath = path.resolve(
    __dirname,
    `./node_modules/@react-navigation/routers/lib/module/${file}.js`,
  );
  const code = fs.readFileSync(filePath).toString();
  if (code.endsWith('/*shim-added*/')) return;
  fs.writeFileSync(
    filePath,
    `${code}\n${types
      .map(type => `export const ${type} = null;`)
      .join('\n')}/*shim-added*/`,
  );
});

process.env.PLATFORM = 'WEB';

const modulesToAllow = require('./modules-to-transpile').map(
  mod => new RegExp(mod),
);

module.exports = {
  mode: webpackEnv,
  devServer: {
    contentBase: path.join(__dirname, 'web'),
    contentBasePublicPath: '/assets/',
    publicPath: '/',
    compress: true,
    disableHostCheck: true,
    port: 9000,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  entry: {
    app: path.join(rootDir, './index.js'),
  },
  output: {
    path: path.resolve(rootDir, 'web-dist'),
    chunkFilename: '[name]-[hash].bundle.js',
    publicPath: '/',
    filename: 'app-[hash].bundle.js',
  },
  devtool: 'source-map',
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {loader: 'css-loader', options: {importLoaders: 1}},
          'postcss-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'public/icons/[name]-[hash].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(tsx|ts|jsx|js|mjs)$/,
        include: path => modulesToAllow.find(mod => mod.test(path)),
        loader: 'babel-loader',
      },

      {
        test: /\.(tsx|ts|jsx|js|mjs)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  plugins: [
    process.env.WEBPACK_PROFILE && new BundleAnalyzerPlugin(),
    new LodashModuleReplacementPlugin(),

    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(webpackEnv !== 'production'),
      "Platform.OS === 'android'": JSON.stringify(false),
      "Platform.OS === 'ios'": JSON.stringify(false),
      "Platform.OS === 'web'": JSON.stringify(true),
      "Platform.OS === 'native'": JSON.stringify(false),
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './web/index.html'),
    }),
    new webpack.HotModuleReplacementPlugin(),
  ].filter(Boolean),
  resolve: {
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.tsx',
      '.png',
      '.jpg',
      '.gif',
      '.css',
      '.ts',
      '.web.jsx',
      '.web.js',
      '.jsx',
      '.js',
    ], // read files in fillowing order
    alias: Object.assign({
      'react-native$': 'react-native-web',
      assets: path.join(rootDir, 'web/assets'),
    }),
  },
};

console.log({web: path.join(rootDir, 'web/assets')});
