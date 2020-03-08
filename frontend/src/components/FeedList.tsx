import * as React from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import FastList from './FastList';
import useSWR from 'swr';
import {apiFetcher, TWEETS_URL} from '../api';
import {useSafeArea} from '../lib/SafeArea';
import {COLORS} from '../lib/theme';
import {sum} from 'lodash';
import {TweetResponse, Tweet, URLPreview} from '../API_TYPES';
import Animated from 'react-native-reanimated';
import Image, {AvatarImage} from './Image';
import {Timestamp} from './Timestamp';
import {scaleRectToWidth, scaleToWidth} from '../lib/Rect';
import {
  LinkPreview,
  FACEBOOK_PREVIEW_SIZE,
  PreviewType,
  getPreviewType,
} from './LinkPreview';
import {measureText, hasTwitterInstalled} from '../lib/Yeet';
import {CONTENT_WIDTH} from './CONTENT_WIDTH';
import {
  BorderlessButton,
  BaseButton,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import {openLink} from '../lib/openLink';
import {useMMKV} from './useMMKV';
import {TwitterFollowButton} from './TwitterFollowButton';
import {PullyScrollViewContext} from './PullyView';
import {ListClicker} from './ListClicker';
import {SCREEN_DIMENSIONS} from './ScreenSize';

const styles = StyleSheet.create({
  container: {
    width: '100%',

    flex: 0,
    position: 'relative',
  },
  list: Platform.select({
    ios: {
      flex: 1,
      flexShrink: 0,
      width: '100%',
      overflow: 'visible',
    },
    android: {
      flex: 1,
      flexShrink: 0,
      width: '100%',
      // overflow: 'visible',
    },
    web: {
      overflow: 'scroll-y',
    },
  }),
  noResultsFound: {
    textAlign: 'center',

    // color: COLORS.mutedLabel
  },
  listItem: {},
});

const SCROLL_INSETS = {top: 0, left: 0, right: 1, bottom: 0};
const LINK_PREVIEW_SIZE = scaleToWidth(CONTENT_WIDTH, FACEBOOK_PREVIEW_SIZE);
const TEXT_ONLY_PREVIEW_SIZE = {
  width: CONTENT_WIDTH,
  height: 84,
};

const SOURCE_HEIGHT = 32;

const listItemStyles = StyleSheet.create({
  listItem: {
    backgroundColor: COLORS.darkMedium,
    borderRadius: 8,
    overflow: 'hidden',
  },
  contentRow: {
    paddingHorizontal: 16,
  },
  wrapper: {
    marginHorizontal: 16,
    paddingVertical: 12,
    shadowRadius: 2,
    shadowOpacity: 0.25,
    shadowColor: 'black',
    elevation: 20,
    shadowOffset: {
      width: 1,
      height: 1,
    },
  },
  text: {
    fontSize: 16,
    color: 'white',
  },
  source: {
    flexDirection: 'row',
    paddingTop: 8,
    height: SOURCE_HEIGHT,
    alignItems: 'center',
  },
  sourceSpacer: {
    width: 8,
    flexBasis: 8,
    height: 1,
  },
  sourceSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
  },
  username: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    color: COLORS.muted,
    fontSize: 16,
    fontWeight: '400',
  },
  sourceSideLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  circleSpacer: {
    width: 4,
    height: 4,
    borderRadius: 2,
    flexBasis: 4,
    backgroundColor: COLORS.muted,
    opacity: 0.5,
    marginLeft: 8,
    marginRight: 8,
  },
  via: {
    color: COLORS.muted,
  },
  textContent: {
    paddingVertical: 8,
  },
  mediaContent: {
    justifyContent: 'center',
  },
});

const VERTICAL_SPACER = 8;

const getTweetMediaSource = (item: Tweet) => {
  if (!item.media || item.media.length === 0) {
    return null;
  }

  const {w: width, h: height} = item.media[0].sizes.medium;
  const _size = scaleRectToWidth(CONTENT_WIDTH, {width, height});
  return {
    uri: item.media[0].media_url_https,
    width: _size.width,
    height: _size.height,
  };
};

export const getHeightForPreview = (preview: URLPreview, type: PreviewType) => {
  if (type === PreviewType.linkOnly) {
    return TEXT_ONLY_PREVIEW_SIZE.height;
  } else if (type === PreviewType.linkWithImage) {
    return LINK_PREVIEW_SIZE.height;
  } else if (type === PreviewType.linkWithImageAndText) {
    return LINK_PREVIEW_SIZE.height + 40;
  } else if (type === PreviewType.linkWithText) {
    return TEXT_ONLY_PREVIEW_SIZE.height;
  } else {
    return 0;
  }
};

const measureTweetText = (text: string) =>
  measureText({
    fontSize: 16,
    fontWeight: 'normal',
    width: CONTENT_WIDTH - 32,
    text: text,
  }).height;

export const getTweetHeight = (item: Tweet) => {
  const mediaSource = getTweetMediaSource(item);
  const urlPreview = item.url_preview;
  const previewType =
    item.url_preview && !mediaSource
      ? getPreviewType(item.url_preview, item.text.trim().length === 0)
      : null;
  return sum([
    SOURCE_HEIGHT,
    measureTweetText(item.text),
    mediaSource?.height || 0,
    previewType ? getHeightForPreview(urlPreview, previewType) : 0,
    16,
  ]);
};

const FeedListItem = ({item, onPress}: {item: Tweet}) => {
  const media = React.useMemo(() => {
    return getTweetMediaSource(item);
  }, [item, item.media, getTweetMediaSource]);
  const handlePress = React.useCallback(() => onPress && onPress(item), [item]);

  const height = getTweetHeight(item);

  return (
    <View style={{height: height + VERTICAL_SPACER}}>
      <ListClicker onPress={handlePress}>
        <Animated.View
          height={height}
          style={[listItemStyles.wrapper, {height}]}>
          <View style={listItemStyles.listItem}>
            <View style={[listItemStyles.source, listItemStyles.contentRow]}>
              <View style={listItemStyles.sourceSideLeft}>
                <AvatarImage
                  url={item.photo_url}
                  size={24}
                  srcWidth={72}
                  srcHeight={72}
                  style={listItemStyles.avatar}
                />

                <View style={listItemStyles.sourceSpacer} />

                <Text style={listItemStyles.username}>{item.username}</Text>

                <View style={listItemStyles.sourceSpacer} />

                <Timestamp
                  time={item.timestamp}
                  style={listItemStyles.timestamp}
                />
                <View style={listItemStyles.circleSpacer} />

                <Text style={listItemStyles.via}>via Twitter</Text>

                <View style={listItemStyles.sourceSpacer} />
              </View>

              <View style={listItemStyles.sourceSide}></View>
            </View>
            {item.text.length > 0 && (
              <View
                style={[
                  listItemStyles.textContent,
                  listItemStyles.contentRow,
                  {height: measureTweetText(item.text)},
                ]}>
                <Text lineBreakMode="tail" style={listItemStyles.text}>
                  {item.text}
                </Text>
              </View>
            )}
            {media && (
              <View style={listItemStyles.mediaContent}>
                <Image
                  source={media}
                  borderRadius={0}
                  style={[
                    listItemStyles.media,
                    {height: media.height, width: media.width},
                  ]}
                />
              </View>
            )}

            {!media && item.url_preview && (
              <LinkPreview
                preview={item.url_preview}
                showText={item.text.trim().length === 0}
                width={LINK_PREVIEW_SIZE.width}
                height={LINK_PREVIEW_SIZE.height}
              />
            )}
          </View>
        </Animated.View>
      </ListClicker>
      {/* <View style={{height: VERTICAL_SPACER}} /> */}
    </View>
  );
};

const ListComponent = ({
  itemWidth,
  columnCount,
  data = [],
  ListEmptyComponent,
  scrollEnabled = true,
  nativeViewRef,
  sections,
  scrollY,
  height,
  listKey,
  onPress,
  inset,
  translateY,
  bottomInset = 0,
  isLoading = false,
  waitFor,
  headerHeight,
  socialHandle,
  insetHeight,
  simultaneousHandlers,
  listRef,
  onPressSocial,
  isModal,
  offset,
  networkStatus,
  ...otherProps
}: {
  data: Array<Tweet>;
}) => {
  const {bottom} = useSafeArea();
  const sectionCounts = React.useMemo(() => [data.length], [data, data.length]);

  const renderRow = React.useCallback(
    (section: number, row: number) => {
      const item = data[row];

      return <FeedListItem key={item.id} item={item} onPress={onPress} />;
    },
    [onPress, data],
  );

  const contentInset = React.useMemo(
    () => ({
      top: inset || 0,
      left: 0,
      right: 0,
      bottom: Math.abs((bottomInset * -1 + (isModal ? 0 : bottom)) * -1),
    }),
    [inset, bottomInset, isModal, bottom],
  );
  const contentOffset = React.useMemo(
    () => ({
      y: offset || 0,
      x: 0,
    }),
    [offset],
  );

  const getHeight = React.useCallback(
    (section: number, row: number) => {
      const item = data[row];

      return getTweetHeight(item) + VERTICAL_SPACER;
    },
    [data, getTweetHeight],
  );

  const renderHeader = React.useCallback(() => {
    if (!socialHandle) {
      return <View style={{height: headerHeight}} />;
    }

    return <TwitterFollowButton onPress={onPressSocial} />;
  }, [headerHeight, socialHandle, onPressSocial]);

  return (
    <FastList
      contentInsetAdjustmentBehavior="never"
      keyboardDismissMode="on-drag"
      contentInset={contentInset}
      contentOffset={contentOffset}
      insetBottom={Math.abs(contentInset.bottom) * -1}
      insetTop={contentInset.top}
      disableScrollViewPanResponder={false}
      ref={listRef}
      scrollTopValue={scrollY}
      scrollIndicatorInsets={SCROLL_INSETS}
      // renderHeader={this.props.renderHeader}
      automaticallyAdjustContentInsets={false}
      waitFor={waitFor}
      nativeViewRef={nativeViewRef}
      simultaneousHandlers={simultaneousHandlers}
      keyboardShouldPersistTaps="always"
      isLoading={isLoading}
      renderRow={renderRow}
      scrollY={scrollY}
      containerHeight={height}
      scrollToOverflowEnabled
      scrollEnabled={scrollEnabled}
      overScrollMode="always"
      footerHeight={0}
      isFastList
      bounces={false}
      stickyHeaders={false}
      style={styles.list}
      // onScrollEnd={this.handleScrollEnd}
      isFastList
      listKey={listKey}
      headerHeight={headerHeight}
      renderHeader={renderHeader}
      renderEmpty={ListEmptyComponent}
      rowHeight={getHeight}
      sections={sectionCounts}
    />
  );
};

export const FeedList = ({
  nativeViewRef,
  scrollEnabled,
  scrollY,
  listRef,
  height,
  headerHeight,
  insetHeight,
  translateY,
}) => {
  const {data: tweets, error} = useSWR<TweetResponse>(TWEETS_URL, apiFetcher);
  const [showFollowButton, setShowFollowButton] = useMMKV(
    'SHOW_FOLLOW_BUTTON',
    0,
    'number',
  );

  const handlePress = React.useCallback(
    (tweet: Tweet) => {
      console.log('PRESS');
      openLink(tweet.url ?? tweet.tweet_url);
    },
    [openLink],
  );

  const {position} = React.useContext(PullyScrollViewContext) ?? {};

  const handlePressFollow = React.useCallback(
    (tweet: Tweet) => {
      const username = tweets?.social_profiles?.twitter;
      setShowFollowButton(0);
      Linking.openURL(
        `twitter://user?screen_name=${encodeURIComponent(username)}`,
      );
    },
    [tweets, setShowFollowButton],
  );

  return (
    <ListComponent
      data={!tweets ? [] : tweets.data}
      socialHandle={tweets?.social_profiles?.twitter}
      isLoading={!tweets}
      nativeViewRef={nativeViewRef}
      showFollowButton={showFollowButton && tweets?.social_profiles?.twitter}
      onPressSocial={handlePressFollow}
      scrollY={scrollY}
      listRef={listRef}
      listKey="FEED"
      insetHeight={insetHeight}
      onPress={handlePress}
      translateY={translateY}
      headerHeight={
        tweets?.social_profiles?.twitter && showFollowButton ? 52 : 0
      }
      scrollEnabled={position === 'top'}
      height={height}
    />
  );
};
