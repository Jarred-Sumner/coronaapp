import * as React from 'react';
import {useMMKV} from '../components/useMMKV';
import {getBoundByRegion} from '../lib/getBoundByRegion';

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

export const RegionContext = React.createContext({
  region: INITIAL_REGION,
  setRegion: () => {},
});

export const RegionProvider = ({children}) => {
  const [region, setRegion] = useMMKV('mapregion', INITIAL_REGION, 'object');

  const contextValue = React.useMemo(
    () => ({
      region,
      setRegion,
    }),
    [region, setRegion],
  );

  return (
    <RegionContext.Provider value={contextValue}>
      {children}
    </RegionContext.Provider>
  );
};
