import * as React from 'react';
import {isArray} from 'lodash';
import {ImageProps, Image, unstable_createElement} from 'react-native';

export const SICK_BUTTON_SOURCE = [
  {
    uri: require('assets/SickButton.png').default,
    width: 71,
    height: 72,
  },
  {
    uri: require('assets/SickButton@2x.png').default,
    width: 71 * 2,
    height: 72 * 2,
  },
  {
    uri: require('assets/SickButton@3x.png').default,
    width: 71 * 3,
    height: 72 * 3,
  },
];

export const SHARE_BUTTON_SOURCE = [
  {
    uri: require('assets/Share.png').default,
    width: 71,
    height: 72,
  },
  {
    uri: require('assets/Share@2x.png').default,
    width: 71 * 2,
    height: 72 * 2,
  },
  {
    uri: require('assets/Share@3x.png').default,
    width: 71 * 3,
    height: 72 * 3,
  },
];

export const STATS_BUTTON_SOURCE = [
  {
    uri: require('assets/Graphs.png').default,
    width: 71,
    height: 72,
  },
  {
    uri: require('assets/Graphs@2x.png').default,
    width: 71 * 2,
    height: 72 * 2,
  },
  {
    uri: require('assets/Graphs@3x.png').default,
    width: 71 * 3,
    height: 72 * 3,
  },
];

export const CHEVRON_DOWN = [
  {
    uri: require('assets/ChevronDown.png').default,
    width: 12,
    height: 8,
  },
  {
    uri: require('assets/ChevronDown@2x.png').default,
    width: 12 * 2,
    height: 8 * 2,
  },
  {
    uri: require('assets/ChevronDown@3x.png').default,
    width: 12 * 3,
    height: 8 * 3,
  },
];

export const LOCATION_BUTTON_SOURCE = [
  {
    uri: require('assets/Location.png').default,
    width: 70,
    height: 70,
  },
  {
    uri: require('assets/Location@2x.png').default,
    width: 70 * 2,
    height: 70 * 2,
  },
  {
    uri: require('assets/Location@3x.png').default,
    width: 70 * 3,
    height: 70 * 3,
  },
];

export const CHECK = [
  {
    uri: require('assets/Check.png').default,
    width: 20,
    height: 16,
  },
  {
    uri: require('assets/Check@2x.png').default,
    width: 20 * 2,
    height: 16 * 2,
  },
  {
    uri: require('assets/Check@3x.png').default,
    width: 20 * 3,
    height: 16 * 3,
  },
];

export const CLOSE_BUTTON_SOURCE = [
  {
    uri: require('assets/CloseButton.png').default,
    width: 40,
    height: 40,
  },
  {
    uri: require('assets/CloseButton@2x.png').default,
    width: 40 * 2,
    height: 40 * 2,
  },
  {
    uri: require('assets/CloseButton@3x.png').default,
    width: 40 * 3,
    height: 40 * 3,
  },
];

export const BitmapIcon = React.memo((props: ImageProps) => {
  const {style, source, resizeMode} = props;

  let src;
  let width;
  let height;
  let srcSet;
  if (isArray(source)) {
    src = source[0].uri;
    width = source[0].width;
    height = source[0].height;
    let _srcSet = {};

    source.forEach((source, index) => {
      let key = `${index + 1}x`;
      if (typeof source.scale === 'number') {
        key = `${source.scale}x`;
      }

      _srcSet[key] = source.uri;
    });

    srcSet = Object.entries(_srcSet)
      .map(([scale, uri]) => `${uri} ${scale}`)
      .join(', ');
  } else if (typeof source === 'string') {
    src = source;
  } else if (typeof source === 'object') {
    src = source[0].uri;
    width = source[0].width;
    height = source[0].height;
  }

  return unstable_createElement('img', {
    style,
    src,
    srcSet,
    width,
    height,
  });
});
