import * as React from 'react';
import {useMMKV} from '../components/useMMKV';
import {getBoundByRegion} from '../lib/getBoundByRegion';
import useNavigation, {useRoute} from '../components/useNavigation';
import {getDistance, getPreciseDistance} from 'geolib';

const _INITIAL_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  altitude: 1000 * 50,
  longitudeDelta: 0.0421,
};

const region = getBoundByRegion(_INITIAL_REGION, 1.0);
export const INITIAL_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.0922,
  altitude: 1000 * 50,
  longitudeDelta: 0.0421,
  minLongitude: region[0],
  minLatitude: region[1],
  maxLongitude: region[2],
  maxLatitude: region[3],
};

export const RegionContext = React.createContext(null);

export const RegionProvider = ({children}) => {
  const {setParams, params = {}} = useRoute();

  const [region, setRegion] = useMMKV(
    'mapregion',
    () => {
      const {
        lat: _latitude,
        lng: _longitude,
        dlat: _latitudeDelta,
        dlng: _longitudeDelta,
        a: _altitude,
      } = params;

      if (
        _latitude &&
        _longitude &&
        _latitudeDelta &&
        _longitudeDelta &&
        _altitude
      ) {
        const latitude = Number(_latitude);
        const longitude = Number(_longitude);
        const latitudeDelta = Number(_latitudeDelta);
        const longitudeDelta = Number(_longitudeDelta);
        const minLatitude = latitude - latitudeDelta;
        const minLongitude = latitude - longitudeDelta;
        const maxLatitude = latitude + latitudeDelta;
        const maxLongitude = longitude + longitudeDelta;

        return {
          latitude: Number(latitude),
          longitude: Number(longitude),
          altitude: Number(_altitude),
          minLatitude: Number(minLatitude),
          minLongitude: Number(minLongitude),
          maxLongitude: Number(maxLongitude),
          maxLatitude: Number(maxLatitude),
        };
      } else {
        return INITIAL_REGION;
      }
    },
    'object',
    !!params.lat,
  );

  const updateRegion = React.useCallback(
    region => {
      const {
        latitude: lat,
        longitude: lng,
        altitude,
        minLatitude: min_lat,
        minLongitude: min_lng,
        maxLongitude: max_lng,
        maxLatitude: max_lat,
      } = region;
      setParams({
        lat: lat.toFixed(5),
        lng: lng.toFixed(5),
        dlat: (lat - min_lat).toFixed(5),
        dlng: (lng - min_lng).toFixed(5),
        a: Math.floor(altitude),
      });
      setRegion(region);
    },
    [setParams, setRegion],
  );

  const contextValue = React.useMemo(
    () => ({
      region,
      setRegion: updateRegion,
    }),
    [region, updateRegion],
  );

  return (
    <RegionContext.Provider value={contextValue}>
      {children}
    </RegionContext.Provider>
  );
};
