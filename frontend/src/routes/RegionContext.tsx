import * as React from 'react';
import {useMMKV} from '../components/useMMKV';
import {getBoundByRegion} from '../lib/getBoundByRegion';
import useNavigation, {useRoute} from '../components/useNavigation';
import {getDistance, getPreciseDistance} from 'geolib';

const _INITIAL_REGION = {
  latitude: 39.33692,
  longitude: -98.48274,
  latitudeDelta: -15.58375,
  altitude: 1002499,
  zoom: 6,
  longitudeDelta: -29.7657,
};

const region = getBoundByRegion(_INITIAL_REGION, 1.0);
export const INITIAL_REGION = {
  latitude: 39.33692,
  longitude: -98.48274,
  latitudeDelta: -15.58375,
  altitude: 1002499,
  zoom: 6,
  longitudeDelta: -29.7657,
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
        z: _zoom,
      } = params;

      if (
        _latitude &&
        _longitude &&
        _latitudeDelta &&
        _longitudeDelta &&
        _zoom
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
          zoom: Number(_zoom),
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
        zoom,
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
        z: zoom,
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
