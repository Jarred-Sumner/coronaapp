import memoizee from 'memoizee';
import {PixelRatio} from 'react-native';
import {GeocodeLocation} from './GeocodeLocation';

const getCanvas = (width: number): CanvasRenderingContext2D => {
  const canvasEl = document.createElement('canvas');
  canvasEl.width = width;
  canvasEl.height = 500;
  return canvasEl.getContext('2d');
};

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  x,
  y,
  maxWidth,
): Array<TextMetrics> {
  var words = text.split(' '),
    line = '',
    lineCount = 0,
    i,
    test;
  var metrics: TextMetrics;
  let measurements = [];

  for (i = 0; i < words.length; i++) {
    test = words[i];
    metrics = context.measureText(test);
    while (metrics.width > maxWidth) {
      // Determine how much of the word will fit
      test = test.substring(0, test.length - 1);
      metrics = context.measureText(test);
    }
    if (words[i] != test) {
      words.splice(i + 1, 0, words[i].substr(test.length));
      words[i] = test;
    }

    test = line + words[i] + ' ';
    metrics = context.measureText(test);

    if (metrics.width > maxWidth && i > 0) {
      context.fillText(line, x, y);
      line = words[i] + ' ';
      y += metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
      measurements.push(metrics);
    } else {
      line = test;
    }
  }

  context.fillText(line, x, y);
  if (line.trim().length > 0) {
    measurements.push(context.measureText(line));
  }
  return measurements;
}

let heightCache = {};
const determineFontHeightInPixels = font => {
  var result = heightCache[font];

  if (!result) {
    var fontDraw = document.createElement('canvas');
    var ctx = fontDraw.getContext('2d');
    ctx.fillRect(0, 0, fontDraw.width, fontDraw.height);
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'white';
    ctx.font = font;
    ctx.fillText('gM', 0, 0);
    var pixels = ctx.getImageData(0, 0, fontDraw.width, fontDraw.height).data;
    var start = -1;
    var end = -1;
    for (var row = 0; row < fontDraw.height; row++) {
      for (var column = 0; column < fontDraw.width; column++) {
        var index = (row * fontDraw.width + column) * 4;
        if (pixels[index] === 0) {
          if (column === fontDraw.width - 1 && start !== -1) {
            end = row;
            row = fontDraw.height;
            break;
          }
          continue;
        } else {
          if (start === -1) {
            start = row;
          }
          break;
        }
      }
    }
    result = end - start;
    heightCache[font] = result;
  }
  return result;
};

const _measureText = memoizee((fontSize, _text, fontWeight, width) => {
  if (_text.trim().length === 0) {
    return {height: 0};
  }

  console.time('MEASURE TEXT');
  let height = 0;

  const lines = _text.split('\n');

  let ascent = null;
  let descent = null;
  const measureLine = (text, isLastLine) => {
    const context = getCanvas(width);
    context.font = `${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif`;

    context.fillText(text, 0, 0);
    const measurements = wrapText(context, text, 0, 0, width);

    if (ascent === null) {
      ascent =
        measurements?.fontBoundingBoxAscent ??
        measurements.actualBoundingBoxAscent;
    }

    descent =
      measurements?.fontBoundingBoxDescent ??
      measurements.actualBoundingBoxDescent;

    measurements.forEach(
      ({actualBoundingBoxAscent, actualBoundingBoxDescent}) => {
        height += Math.ceil(actualBoundingBoxAscent + actualBoundingBoxDescent);
      },
    );
  };

  const measureEmptyLine = () => {
    const context = getCanvas(width);
    context.font = `${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif`;

    height += determineFontHeightInPixels(context.font);
  };

  let newLineCount = lines.length - 1;
  for (let i = 0; i < newLineCount; i++) {
    measureEmptyLine();
  }
  // measureLine(_text);
  lines.forEach((line, iindex) =>
    measureLine(line, iindex + 1 === lines.length),
  );

  height = height + ascent + descent;
  console.timeEnd('MEASURE TEXT');
  return {
    height: Math.ceil(height),
  };
});

export const measureText = ({
  fontSize,
  text,
  fontWeight,
  width,
}): TSMeasureResult => _measureText(fontSize, text, fontWeight, width);

export const getMapBounds = (handle, mapRef) => {
  const {
    lat: minLatitude,
    lng: minLongitude,
  } = mapRef.map.getBounds().getNorthEast();
  const {
    lat: maxLatitude,
    lng: maxLongitude,
  } = mapRef.map.getBounds().getSouthWest();
  return [minLongitude(), minLatitude(), maxLongitude(), maxLatitude()];
};

export const snapSheetToPosition = (handle, size, ref) => {
  if (size === 'top') {
    ref.snapSheetToTop();
  } else if (size === 'bottom') {
    ref.snapSheetToBottom();
  }
};

export const getItem = (key: string, type: string): any => {
  let value = null;
  console.time('GET ITEM');
  if (typeof localStorage !== 'undefined') {
    value = localStorage.getItem(key) ?? null;

    if (value && typeof value === 'string' && type === 'object') {
      try {
        value = JSON.parse(value);
      } catch (exception) {
        value = null;
      }
    }
  }
  console.timeEnd('GET ITEM');

  return value;
};

export const removeItem = (key: string): any => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.removeItem(key) ?? null;
  } else {
    return null;
  }
};

export const geocode = (
  latitude: number,
  longitude: number,
): Promise<Array<GeocodeLocation>> => {
  return Promise.resolve<Array<GeocodeLocation>>([]);
};

export const setItem = (key: string, value: any, type: string): any => {
  if (typeof localStorage !== 'undefined') {
    let _value = value;
    if (typeof value === 'object') {
      _value = JSON.stringify(value);
    }
    localStorage.setItem(key, _value);
  } else {
    return null;
  }
};

export const getLocationStatus = (): LocationPermissionStatus => {
  return null;
};

export const getLastLocation = (): Location | null => {
  null;
};

export const hasTwitterInstalled = (): Boolean => false;
