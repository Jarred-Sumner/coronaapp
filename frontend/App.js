/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import {ActionSheetProvider} from '@expo/react-native-action-sheet';

import * as React from 'react';
import {Platform, View} from 'react-native';
import {CountryProvider} from './src/components/CountryContext';
import {UserLocationProvider} from './src/components/UserLocationContext';
import Routes from './src/lib/Routes';
import {RegionProvider} from './src/routes/RegionContext';
import {SafeAreaProvider} from 'react-native-safe-area-context';

export const App = ({RoutesComponent = Routes, routesProps}) => (
  <SafeAreaProvider>
    <ActionSheetProvider>
      <CountryProvider>
        <RegionProvider>
          <UserLocationProvider>
            <RoutesComponent {...routesProps} />
          </UserLocationProvider>
        </RegionProvider>
      </CountryProvider>
    </ActionSheetProvider>
  </SafeAreaProvider>
);

export default App;
