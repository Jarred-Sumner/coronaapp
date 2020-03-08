import {TSMeasureResult} from 'react-native-text-size';
import memoizee from 'memoizee';
import {NativeModules} from 'react-native';
import {LocationPermissionStatus, Location} from 'react-native-location';
import {isEmpty} from 'lodash';
import {LocationButton} from '../components/LocationButton';
import {GeocodeLocation} from './GeocodeLocation';
import {getBoundByRegion} from './getBoundByRegion';

const TextSize = NativeModules.RNTextSize;
const YeetBinder = NativeModules.YeetBinder;

const jsi = () => {
  if (typeof global.YeetJSI !== 'undefined') {
    return global.YeetJSI;
  } else {
    return undefined;
  }
};

const _measureText = memoizee((fontSize, text, fontWeight, width) => {
  const resp =
    TextSize?.measureSync({
      fontSize,
      text,
      fontWeight,
      width,

      includeFontPadding: true,
    }) ?? {};

  if (resp?.height) {
    resp.height += fontSize;
  }

  return resp;
});

export const measureText = ({
  fontSize,
  text,
  fontWeight,
  width,
}): TSMeasureResult => {
  return _measureText(fontSize, text, fontWeight, width) ?? {height: 0};
};

export const getMapBounds = (handle, _, region) => {
  return getBoundByRegion(region);
};

export const snapSheetToPosition = (handle, size, ref) =>
  ref?.updatePosition(size);

const _getItem = (key: string, type: string): any => {
  if (type === 'number') {
    return YeetBinder?.getDouble(key);
  } else if (type === 'string') {
    return YeetBinder?.getString(key);
  } else if (type === 'object') {
    const obj = YeetBinder?.getObject(key);

    if (isEmpty(obj)) {
      return null;
    } else {
      return obj;
    }
  }
};

export const getItem = (key: string, type: string): any => {
  console.time('Get item');
  const item = _getItem(key, type);
  console.timeEnd('Get item');
  return item;
};

export const removeItem = (key: string): any => YeetBinder.removeItem(key);

export const setItem = (key: string, value: any, type: string): any =>
  YeetBinder.setItem(key, type, {value});

export const getLocationStatus = (): LocationPermissionStatus => {
  return YeetBinder.checkLocationPermission();
};

export const geocode = (
  latitude: number,
  longitude: number,
): Promise<Array<GeocodeLocation>> => {
  return YeetBinder.geocode({latitude, longitude});
};

export const getLastLocation = (): Location | null => {
  return jsi()?.lastLocation;
};

export const hasTwitterInstalled = (): Boolean =>
  YeetBinder.hasTwitterInstalled();
