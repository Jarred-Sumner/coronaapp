/**
 * @format
 */

import * as React from 'react';
import {AppRegistry, Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-console-time-polyfill';

import * as Sentry from '@sentry/react-native';

Sentry.init({ 
  dsn: 'https://8282f3cfc20b408a946fe624b7175ef3@sentry.io/3497574', 
});


AppRegistry.registerComponent(appName, () => App);
