import {TSMeasureResult} from 'react-native-text-size';
import memoizee from 'memoizee';
import {LocationPermissionStatus, Location} from 'react-native-location';

const _measureText = memoizee((fontSize, text, fontWeight, width) => {
  return global.YeetJSI.measureText({
    fontSize,

    text,
    fontWeight,
    width,
  });
});

export const measureText = ({
  fontSize,
  text,
  fontWeight,
  width,
}): TSMeasureResult => _measureText(fontSize, text, fontWeight, width);

export const getMapBounds = handle => global.YeetJSI.getMapBounds(handle);

export const snapSheetToPosition = (handle, size) =>
  global.YeetJSI.snapSheetToPosition(handle, size);

export const getItem = (key: string, type: string): any =>
  global.YeetJSI?.getItem(key, type);

export const removeItem = (key: string): any => global.YeetJSI?.removeItem(key);

export const setItem = (key: string, value: any, type: string): any =>
  global.YeetJSI?.setItem(key, value, type);

export const getLocationStatus = (): LocationPermissionStatus => {
  return global.YeetJSI?.locationAuthorizationStatus;
};

export const getLastLocation = (): Location | null => {
  return global.YeetJSI?.lastLocation;
};

export const hasTwitterInstalled = (): Boolean =>
  global.YeetJSI?.hasTwitterInstalled;
