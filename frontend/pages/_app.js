import * as React from 'react';
import App from '../App';

function CustomApp({Component, pageProps}) {
  return <App RoutesComponent={Component} routesProps={pageProps} />;
}

export default CustomApp;
