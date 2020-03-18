/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import * as React from 'react';
import {CountryProvider} from './src/components/CountryContext';
import {UserLocationProvider} from './src/components/UserLocationContext';
import Routes from './src/lib/Routes';
import {RegionProvider} from './src/routes/RegionContext';

export const App = ({RoutesComponent = Routes, routesProps}) => {
  return (
    <CountryProvider>
      <RegionProvider>
        <UserLocationProvider>
          <RoutesComponent {...routesProps} />
        </UserLocationProvider>
      </RegionProvider>
    </CountryProvider>
  );
};

export default App;
