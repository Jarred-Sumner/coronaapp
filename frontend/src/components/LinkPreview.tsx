import * as React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {URLPreview} from '../API_TYPES';
import {Image, AvatarImage} from './Image';
import {COLORS} from '../lib/theme';
import URL from 'url-parse';
import {ImageMimeType} from '../lib/imageSearch';

export const FACEBOOK_PREVIEW_SIZE = {
  width: 560,
  height: 292,
};

const styles = StyleSheet.create({
  container: {},
  imageContainer: {
    position: 'relative',
  },
  urlRow: {},
  textOnly: {},
  overlay: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    left: 0,
    right: 0,
  },
  logo: {
    position: 'absolute',
    top: 32,
    left: 32,
  },
  titleRow: {},
  bodyRow: {},
  urlOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  overlayUrlText: {
    fontWeight: '500',

    fontSize: 14,
    color: '#ccc',
    textTransform: 'uppercase',
  },
  image: {
    backgroundColor: '#666',
  },
  urlText: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});

export enum PreviewType {
  linkOnly,
  linkWithImage,
  linkWithImageAndText,
  linkWithText,
}

export const getPreviewType = (preview: URLPreview, showText: Boolean) => {
  const {
    author,
    date,
    description,
    image,
    logo,
    publisher,
    title,
    url,
  } = preview;

  const hasImage = image && image !== logo;

  if (title && hasImage && showText) {
    return PreviewType.linkWithImageAndText;
  } else if (title && showText) {
    return PreviewType.linkWithText;
  } else if (hasImage) {
    return PreviewType.linkWithImage;
  } else {
    return PreviewType.linkOnly;
  }
};

const TitleText = ({children}) => {
  return (
    <Text style={styles.titleText} numberOfLines={1} lineBreakMode="tail">
      {children}
    </Text>
  );
};

const getURLabel = (url: string) => {
  const _url = new URL(url);
  let _text = [_url.hostname, _url.pathname].join('');

  if (_text.startsWith('www.')) {
    _text = _text.slice('www.'.length);
  }

  return _text.slice(0, 70);
};

const URLText = ({url, overlay}) => {
  const text = React.useMemo(() => {
    return getURLabel(url);
  }, [url, getURLabel]);
  return (
    <Text
      style={overlay ? styles.overlayUrlText : styles.urlText}
      numberOfLines={1}>
      {text}
    </Text>
  );
};

const BodyText = ({children, numberOfLines = 3}) => {
  return (
    <Text
      style={styles.bodyText}
      numberOfLines={numberOfLines}
      lineBreakMode="tail">
      {children}
    </Text>
  );
};

export const LinkPreview = ({
  preview,
  height,
  showText = true,
  width,
}: {
  preview: URLPreview;
  height: number;
  width: number;
}) => {
  let type = getPreviewType(preview, showText);

  if (type === PreviewType.linkOnly) {
  } else if (type === PreviewType.linkWithText) {
    return (
      <View height={height} style={styles.container}>
        <View style={styles.textOnly}>
          <View style={styles.urlRow}>
            <URLText url={preview.url}></URLText>
          </View>

          <View style={styles.titleRow}>
            <TitleText>{preview.title}</TitleText>
          </View>

          {preview.description && (
            <View style={styles.bodyRow}>
              <BodyText>{preview.description}</BodyText>
            </View>
          )}
        </View>
      </View>
    );
  } else if (type === PreviewType.linkWithImageAndText) {
    const source = {uri: preview.image, width, height};
    return (
      <View height={height} style={styles.container}>
        <View
          width={width}
          height={height}
          style={[styles.imageContainer, {width, height}]}>
          <Image
            paused={false}
            source={source}
            style={[styles.image, {height, width}]}
          />

          {/* {preview.logo && (
            <AvatarImage
              url={preview.logo}
              size={32}
              style={styles.logo}
              srcWidth={32}
              srcHeight={32}
            />
          )} */}

          <View style={styles.urlOverlay}>
            <URLText overlay url={preview.url}></URLText>
          </View>
        </View>

        <View style={styles.overlay}>
          <View style={styles.titleRow}>
            <TitleText>{preview.title}</TitleText>
          </View>
        </View>
      </View>
    );
  } else if (type === PreviewType.linkWithImage) {
    const source = {uri: preview.image, width, height};
    return (
      <View height={height} style={styles.container}>
        <View
          width={width}
          height={height}
          style={[styles.imageContainer, {width, height}]}>
          <Image
            paused={false}
            source={source}
            style={[styles.image, {height, width}]}
          />

          {/* {preview.logo && (
            <AvatarImage
              url={preview.logo}
              mimeType={ImageMimeType.jpeg}
              size={32}
              style={styles.logo}
              srcWidth={72}
              srcHeight={72}
            />
          )} */}

          <View style={styles.urlOverlay}>
            <URLText overlay url={preview.url}></URLText>
          </View>
        </View>
      </View>
    );
  }

  return null;
};
