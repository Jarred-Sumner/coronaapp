import * as React from 'react';

if (typeof window !== 'undefined' && !window.setImmediate) {
  window.setImmediate = cb => window.setTimeout(cb, 0);
}

const App = require('../App').default;

function CustomApp({Component, pageProps}) {
  return <App RoutesComponent={Component} routesProps={pageProps} />;
}

export default CustomApp;
