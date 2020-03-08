import {convertDistance} from 'geolib';
import Numeral from 'numeral';
import {isFinite, isNaN} from 'lodash';

export const formatDistance = (distance: number, unit = 'mi') => {
  const value = convertDistance(distance, unit);
  if ((!isFinite(value) || value < 1) && unit === 'mi') {
    return formatDistance(distance, 'ft');
  }

  if (!isFinite(value)) {
    return `- ${unit} away`;
  }

  return `${Numeral(value).format('0,0')} ${unit} away`;
};
