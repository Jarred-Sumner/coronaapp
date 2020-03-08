/**
 * @format
 */

import * as React from 'react';
import {AppRegistry, Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

if (Platform.OS === 'web') {
  AppRegistry.registerComponent(appName, () => App);

  AppRegistry.runApplication(appName, {
    rootTag: document.getElementById('react-root'),
  });
} else if (Platform.OS === 'android') {
  if (process.env.NODE_ENV !== 'production') {
    require('react-native-console-time-polyfill');
  }

  let RootApp = App;
  if (process.env.NODE_ENV === 'production') {
    const Sentry = require('@sentry/react-native');

    Sentry.init({
      dsn: 'https://8282f3cfc20b408a946fe624b7175ef3@sentry.io/3497574',
    });

    const codePush = require('react-native-code-push');

    RootApp = codePush({
      deploymentKey: '7n3uvfwqqM6p8_1gadavnz-2dBkwtnqGWl5wg',
    })(App);

    codePush.getUpdateMetadata().then(update => {
      if (update) {
        const Sentry = require('@sentry/react-native');
        Sentry.setRelease(update.appVersion + '-codepush:' + update.label);
      }
    });
  }

  AppRegistry.registerComponent(appName, () => RootApp);
}
