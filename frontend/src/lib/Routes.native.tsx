/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import * as Sentry from '@sentry/react-native';
import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {enableScreens} from 'react-native-screens';
import {createNativeStackNavigator} from 'react-native-screens/native-stack';
import {CountryPickerRoute} from '../routes/CountryPickerRoute';
import {MapRoute} from '../routes/MapRoute';
import {ReportSickRoute} from '../routes/ReportSickRoute';
import {StatsRoute} from '../routes/StatsRoute';
import {LayoutAnimation, UIManager, Platform} from 'react-native';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export const MAPPINGS = {
  Home: '/',
  ReportSick: '/report_sick',
  Stats: '/stats',
  CountryPicker: '/country',
};

enableScreens();

const Stack = createNativeStackNavigator();
// const Stack = createStackNavigator();

export const Routes = () => (
  <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        stackPresentation: 'modal',
        contentStyle: {backgroundColor: 'black'},
      }}>
      <Stack.Screen name="Home" component={MapRoute} />
      <Stack.Screen name="ReportSick" component={ReportSickRoute} />
      <Stack.Screen name="Stats" component={StatsRoute} />
      <Stack.Screen name="CountryPicker" component={CountryPickerRoute} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default Routes;
