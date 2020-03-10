const fs = require('fs');
const path = require('path');
const withImages = require('next-images');
const webpack = require('webpack');

process.env.PLATFORM = 'web';

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

const withTM = require('next-transpile-modules')(
  require('./modules-to-transpile'),
); // pass the modules you would like to see transpiled

module.exports = withImages({
  exportPathMap: async function(
    defaultPathMap,
    {dev, dir, outDir, distDir, buildId},
  ) {
    // Home: '/',
    // ReportSick: '/report_sick',
    // Stats: '/stats',
    // CountryPicker: '/country',
    return {
      '/': {
        page: '/',
        query: {
          lat: null,
          lng: null,
          min_lat: null,
          min_lng: null,
          max_lng: null,
          max_lat: null,
        },
      },
      '/report_sick': {page: '/report_sick'},
      '/stats': {page: '/stats'},
      '/country': {page: '/country'},
    };
  },

  inlineImageLimit: 0,
  esModule: true,
  assetPrefix:
    process.env.NODE_ENV === 'production'
      ? 'https://covy.app'
      : 'http://localhost:9000',
  ...withTM({
    typescript: {
      // !! WARN !!
      // Dangerously allow production builds to successfully complete even if
      // your project has type errors.
      //
      // This option is rarely needed, and should be reserved for advanced
      // setups. You may be looking for `ignoreDevErrors` instead.
      // !! WARN !!
      ignoreBuildErrors: true,
      ignoreDevErrors: true,
    },
    webpack: config => {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        // Transform all direct `react-native` imports to `react-native-web`
        'react-native$': 'react-native-web',
        assets: path.join(__dirname, 'web/assets'),
      };
      config.resolve.extensions = [
        '.web.js',
        '.web.ts',
        '.web.tsx',
        ...config.resolve.extensions,
      ];
      config.plugins.push(
        new webpack.DefinePlugin({
          __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
          "Platform.OS === 'android'": JSON.stringify(false),
          "Platform.OS === 'ios'": JSON.stringify(false),
          "Platform.OS === 'web'": JSON.stringify(true),
          "Platform.OS === 'native'": JSON.stringify(false),
        }),
      );

      return config;
    },
  }),
});
