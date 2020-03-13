if (process.env.PLATFORM !== 'WEB') {
  const plugins = [];

  if (process.env.NODE_ENV === 'production') {
    plugins.push('transform-remove-console');
  }

  module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins,
  };
} else {
  module.exports = {
    presets: ['next/babel'],
    plugins: [['react-native-web', {commonjs: false}], 'lodash'],
  };
}
