/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
// import * as Sentry from '@sentry/react-native';
import * as React from 'react';
import {NavigationContainer, useLinking} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {unstable_createElement, View, InteractionManager} from 'react-native';
// import {enableScreens} from 'react-native-screens';

const original = InteractionManager.runAfterInteractions;

InteractionManager.createInteractionHandle = () => {
  window.dispatchEvent(new Event(InteractionManager.Events.interactionStart));
  return 1;
};

InteractionManager.clearInteractionHandle = () => {
  window.dispatchEvent(
    new Event(InteractionManager.Events.interactionComplete),
  );
  return 1;
};

InteractionManager.runAfterInteractions = task => {
  return original(task).done(orig => {
    window.dispatchEvent(
      new Event(InteractionManager.Events.interactionComplete),
    );

    return orig;
  });
};

const ScreenLoader = () => (
  <View style={{width: '100%', height: '100%'}}>
    {unstable_createElement('div', {
      className: 'HI',
    })}
  </View>
);

const CountryPickerRouteComponent = React.lazy(() =>
  import(
    /* webpackChunkName: "CountryPickerRoute" */
    '../routes/CountryPickerRoute'
  ),
);

const CountryPickerRoute = () => (
  <React.Suspense fallback={<ScreenLoader />}>
    <CountryPickerRouteComponent />
  </React.Suspense>
);

import {MapRoute} from '../routes/MapRoute';

const ReportSickRouteComponent = React.lazy(() =>
  import(
    /* webpackChunkName: "ReportSickRoute" */
    '../routes/ReportSickRoute'
  ),
);

const StatsRouteRouteComponent = React.lazy(() =>
  import(/* webpackChunkName: "StatsRoute" */ '../routes/StatsRoute'),
);
const ReportSickRoute = () => (
  <React.Suspense fallback={<ScreenLoader />}>
    <ReportSickRouteComponent />
  </React.Suspense>
);

const StatsRoute = () => (
  <React.Suspense fallback={<ScreenLoader />}>
    <StatsRouteRouteComponent />
  </React.Suspense>
);

if (process.env.NODE_ENV === 'production') {
  // Sentry.init({
  //   dsn: 'https://8282f3cfc20b408a946fe624b7175ef3@sentry.io/3497574',
  // });
}

export const MAPPINGS = {
  Home: '/',
  ReportSick: '/report_sick',
  Stats: '/stats',
  CountryPicker: '/country',
};

// enableScreens();

const Stack = createStackNavigator();
// const Stack = createStackNavigator();

const formatPath = path => {
  return path;
  // return '//app' + path + '/';
  // return [location.protocol, location.hostname].join('://') + '/app' + path;
};

const formatRoot = () => {
  return '/';
  // return [location.protocol, location.hostname].join('://') + '/';
};

export const Routes = () => {
  const navigationRef = React.useRef();
  const [isReady, setIsReady] = React.useState(false);
  const [initialState, setInitialState] = React.useState();

  const {getInitialState} = useLinking(navigationRef, {
    prefixes: [],
    config: {
      Home: {path: formatRoot()},
      ReportSick: {path: formatPath('report_sick')},
      Stats: {path: formatPath(`stats`)},
      CountryPicker: {path: formatPath(`country`)},
    },
  });

  console.log({getInitialState, isReady});

  React.useEffect(() => {
    getInitialState().then(state => {
      if (state) setInitialState(state);
      setIsReady(true);
    }, console.error);
  }, [getInitialState]);

  if (!isReady) return null;

  return (
    <NavigationContainer initialState={initialState} ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardOverlayEnabled: true,
          cardShadowEnabled: true,
          cardStyle: {backgroundColor: 'black'},

          stackPresentation: 'modal',
        }}>
        <Stack.Screen name="Home" component={MapRoute} />
        <Stack.Screen name="ReportSick" component={ReportSickRoute} />
        <Stack.Screen name="Stats" component={StatsRoute} />
        <Stack.Screen name="CountryPicker" component={CountryPickerRoute} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Routes;
console.log('TEST');
