import * as React from 'react';
import {Platform} from 'react-native';
import {LocationPermissionStatus} from 'react-native-location';
import {Location, RNLocation} from '../lib/Location';
import {getLocationStatus} from '../lib/Yeet';
import {useMMKV} from './useMMKV';

RNLocation.configure({
  distanceFilter: 100, // Meters
  desiredAccuracy: {
    ios: 'best',
    android: 'balancedPowerAccuracy',
  },
  // Android only
  androidProvider: 'auto',
  interval: 5000, // Milliseconds
  fastestInterval: 10000, // Milliseconds
  maxWaitTime: 5000, // Milliseconds
  // iOS Only
  activityType: 'other',
  allowsBackgroundLocationUpdates: false,
  headingFilter: 1, // Degrees
  headingOrientation: 'portrait',
  pausesLocationUpdatesAutomatically: false,
  showsBackgroundLocationIndicator: false,
});

type LocationWithStatus = Location & {
  locationStatus: LocationPermissionStatus;
};
type UserLocation = LocationWithStatus & {
  canRequestLocationAccess: Boolean;
  setCanRequestLocationAccess: (enabled: boolean) => void;
};

export const UserLocationContext = React.createContext<UserLocation>({
  latitude: null,
  longitude: null,
  locationStatus: getLocationStatus(),
});

export const hasLocation = (location: UserLocation) =>
  !!(location && location.latitude && location.longitude);

export const UserLocationProvider = ({children}) => {
  const [
    canRequestLocationAccess,
    setCanRequestLocationAccess,
  ] = React.useState(() =>
    Platform.select({
      ios: true,
      web: false,
      android: true,
    }),
  );

  const [location, setLocation] = useMMKV(
    'USER_CURRENT_LOCATION',
    {
      latitude: null,
      longitude: null,
      locationStatus: getLocationStatus(),
    },
    'object',
    false,
  );

  const locationUnsubscriber = React.useRef(null);

  React.useEffect(() => {
    if (!canRequestLocationAccess) {
      return;
    }

    console.log('Requesting...', canRequestLocationAccess);

    if (
      Platform.OS === 'android' &&
      !getLocationStatus().includes('authorized')
    ) {
      RNLocation.requestPermission({
        ios: 'whenInUse', // or 'always'
        android: {
          detail: 'fine', // or 'fine'
          rationale: {
            title: 'We need to access your location',
            message: 'We use your location to show where you are on the map',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          },
        },
      }).then(granted => {
        if (granted) {
          locationUnsubscriber.current = RNLocation.subscribeToLocationUpdates(
            locations => {
              const _location = locations[0];
              if (!setLocation) {
                return;
              }

              setLocation({
                fromMockProvider: _location?.fromMockProvider,
                timestamp: _location?.timestamp,
                speedAccuracy: _location?.speedAccuracy,
                speed: _location?.speed,
                courseAccuracy: _location?.courseAccuracy,
                course: _location?.course,
                altitudeAccuracy: _location?.altitudeAccuracy,
                altitude: _location?.altitude,
                accuracy: _location?.accuracy,
                longitude: _location?.longitude,
                latitude: _location?.latitude,
                locationStatus: _location?.locationStatus,
              });
            },
          );
        }
      });

      return () => {
        locationUnsubscriber?.current();
      };
    }

    locationUnsubscriber.current = RNLocation.subscribeToLocationUpdates(
      locations => {
        const _location = locations[0];
        if (!setLocation) {
          return;
        }

        setLocation({
          fromMockProvider: _location?.fromMockProvider,
          timestamp: _location?.timestamp,
          speedAccuracy: _location?.speedAccuracy,
          speed: _location?.speed,
          courseAccuracy: _location?.courseAccuracy,
          course: _location?.course,
          altitudeAccuracy: _location?.altitudeAccuracy,
          altitude: _location?.altitude,
          accuracy: _location?.accuracy,
          longitude: _location?.longitude,
          latitude: _location?.latitude,
          locationStatus: _location?.locationStatus,
        });
      },
    );

    return () => {
      locationUnsubscriber?.current();
    };
  }, [canRequestLocationAccess]);
  const _setLocation = React.useRef(setLocation);
  _setLocation.current = setLocation;

  const contextValue = React.useMemo(
    () => ({
      ...location,
      canRequestLocationAccess,
      setCanRequestLocationAccess,
      setLocation: _setLocation,
    }),
    [
      canRequestLocationAccess,
      setCanRequestLocationAccess,
      location,
      _setLocation,
    ],
  );

  return (
    <UserLocationContext.Provider value={contextValue}>
      {children}
    </UserLocationContext.Provider>
  );
};
