import * as React from 'react';

if (typeof window !== 'undefined' && !window.setImmediate) {
  window.setImmediate = cb => window.setTimeout(cb, 0);
}

const App = require('../App').default;

function CustomApp({Component, pageProps}) {
  React.useLayoutEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.document
      .querySelectorAll('meta[ssr]')
      .forEach(e => e.parentNode.removeChild(e));

    window.document
      .querySelectorAll('title[ssr]')
      .forEach(e => e.parentNode.removeChild(e));
  }, []);
  return <App RoutesComponent={Component} routesProps={pageProps} />;
}

export default CustomApp;
