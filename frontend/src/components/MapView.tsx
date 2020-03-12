import * as React from 'react';
import {Image, StyleSheet, View, Platform, LayoutAnimation} from 'react-native';
import MapViewComponent, {
  MapEvent,
  Circle as __RawCircle,
  Marker as _RawMarker,
  KmlMarker,
} from './Maps';
import {COLORS} from '../lib/theme';
import {isPointInPolygon, getDistance} from 'geolib';
import chroma from 'chroma-js';
import sources from './MarkerIcons';
import MAPS_STYLE from './MAPS_STYLE';

const _RawCircle = Platform.select({
  ios: __RawCircle,
  android: __RawCircle,
  web: () => null,
});

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

const colors = {
  selected: {
    user_report: chroma(COLORS.selfReported)
      .alpha(0.55)
      .css(),
    infection: chroma(COLORS.confirmed)
      .alpha(0.55)
      .css(),
  },
  unselected: {
    user_report: chroma(COLORS.selfReported)
      .alpha(0.25)
      .css(),
    infection: chroma(COLORS.confirmed)
      .alpha(0.25)
      .css(),
  },
};

const RawMarker = React.memo(_RawMarker);
const RawCircle = React.memo(_RawCircle);

// const ONE_WEEK_AGO = new Date(new Date().getTime() - 604800);

const Marker = ({pin, isSelected, onPress, hasSelection, opacity}) => {
  let image = sources.selected[pin.object];
  const isNotSelected = hasSelection && !isSelected;
  // const lastUpdatedDate = React.useMemo(() => {
  //   return parseISO(pin.last_updated);
  // }, [pin.last_updated, parseISO]);
  // const isVeryOld = React.useMemo(
  //   () => isAfter(lastUpdatedDate, ONE_WEEK_AGO),
  //   [isAfter, parseISO, lastUpdatedDate, ONE_WEEK_AGO],
  // );
  if (isNotSelected || (!isSelected && pin.faded)) {
    image = sources.unselected[pin.object];
  }

  const stopPropagation = React.useCallback(evt => {
    evt.stopPropagation();
  }, []);

  return (
    <RawMarker
      coordinate={pin}
      identifier={pin.id}
      opacity={isSelected ? 1 : opacity}
      onPress={Platform.select({
        ios: stopPropagation,
        android: stopPropagation,
        web: onPress,
      })}
      image={image}
    />
  );
};

const Circle = ({pin, isSelected, hasSelection}) => {
  let color = colors.selected[pin.object];
  const isNotSelected = hasSelection && !isSelected;
  // const lastUpdatedDate = React.useMemo(() => {
  //   return parseISO(pin.last_updated);
  // }, [pin.last_updated, parseISO]);
  // const isVeryOld = React.useMemo(
  //   () => isAfter(lastUpdatedDate, ONE_WEEK_AGO),
  //   [isAfter, parseISO, lastUpdatedDate, ONE_WEEK_AGO],
  // );
  if (isNotSelected || (!isSelected && pin.faded)) {
    color = colors.unselected[pin.object];
  }

  const stopPropagation = React.useCallback(evt => {
    evt.stopPropagation();
  }, []);

  const center = React.useMemo(
    () => ({latitude: pin.latitude, longitude: pin.longitude}),
    [pin.latitude, pin.longitude],
  );

  return (
    <RawCircle
      center={center}
      strokeColor={color}
      fillColor={color}
      radius={500}
      onPress={stopPropagation}
    />
  );
};

const MapComponents = React.memo(
  ({pins, onPressPin, selectedId, displayCircles, circles, kml}) => {
    const renderPin = React.useCallback(
      pin => {
        const {size, latitude, longitude, id, object, color} = pin;

        // let fillColor = color;
        const isSelected = selectedId === id;
        const hasSelection = !!selectedId;
        // if (hasSelection && !isSelected) {
        //   fillColor = chroma(color)
        //     .alpha(0.1)
        //     .css();
        // }
        return (
          <Marker
            key={`${id}-${isSelected}`}
            isSelected={isSelected}
            hasSelection={hasSelection}
            onPress={onPressPin}
            pin={pin}
            opacity={object === 'user_report' ? 0.65 : 1}
          />
        );
      },
      [selectedId, onPressPin],
    );

    const renderCircle = React.useCallback(
      pin => {
        const {size, latitude, longitude, id, object, color} = pin;

        // let fillColor = color;
        const isSelected = selectedId === id;
        const hasSelection = !!selectedId;
        // if (hasSelection && !isSelected) {
        //   fillColor = chroma(color)
        //     .alpha(0.1)
        //     .css();
        // }
        return (
          <Circle
            key={`${id}-${isSelected}`}
            isSelected={isSelected}
            onPressPin={onPressPin}
            hasSelection={hasSelection}
            pin={pin}
          />
        );
      },
      [selectedId, onPressPin],
    );

    const renderKML = React.useCallback(
      kml => <KmlMarker url={kml} key={kml} />,
      [KmlMarker],
    );

    const dots = displayCircles
      ? circles.map(renderCircle)
      : pins.map(renderPin);
    return (
      <>
        {dots}

        {kml?.map(renderKML)}
      </>
    );
  },
);

export const MapView = React.forwardRef(
  (
    {
      initialRegion,
      userLocation,
      region,
      onRegionChange,
      children,
      onPressPin,
      kml,
      height,
      onPressMap,
      selectedId,
      pins = [],
    },
    ref,
  ) => {
    const radius =
      region.minLatitude && region.minLongitude
        ? getDistance(
            {
              latitude: region.minLatitude,
              longitude: region.minLongitude,
            },
            {
              latitude: region.latitude,
              longitude: region.longitude,
            },
          )
        : 9999;

    const displayCircles =
      radius < 5000 && Platform.OS !== 'web' ? true : false;

    const circles = React.useMemo(() => {
      if (
        !region.minLatitude ||
        !region.maxLatitude ||
        !region.minLongitude ||
        !region.maxLongitude ||
        !displayCircles
      ) {
        return [];
      }
      const polygon = [
        {
          latitude: region.minLatitude,
          longitude: region.minLongitude,
        },
        {
          latitude: region.minLatitude,
          longitude: region.maxLongitude,
        },
        {
          latitude: region.maxLatitude,
          longitude: region.maxLongitude,
        },
        {
          latitude: region.maxLatitude,
          longitude: region.minLongitude,
        },
      ];
      return pins.filter(({latitude, longitude}) =>
        polygon.find(
          point => Math.abs(getDistance({latitude, longitude}, point)) < 5000,
        ),
      );
    }, [region, pins, isPointInPolygon, displayCircles]);

    const handlePress = React.useCallback(
      (map: MapEvent) => {
        if (circles.length > 0) {
          const circle = circles.find(
            pin => getDistance(map.nativeEvent.coordinate, pin) < 500,
          );

          if (circle) {
            onPressPin(circle);
            return;
          }
        }

        if (onPressMap) {
          onPressMap(map);
        }
      },
      [pins, onPressPin, onPressMap, circles],
    );

    const handleMarkerPress = React.useCallback(
      ({nativeEvent: {id}}) => {
        const pin = pins.find(pin => pin.id === id);
        pin && onPressPin(pin);
      },
      [pins, onPressPin],
    );

    return (
      <View style={styles.container}>
        <MapViewComponent
          initialRegion={initialRegion}
          style={[styles.map, {height}]}
          showsPointsOfInterest={false}
          showsCompass={false}
          showsMyLocationButton
          onPress={handlePress}
          showsBuildings={false}
          showsTraffic={false}
          zoomEnabled
          userLocation={userLocation}
          onMarkerPress={handleMarkerPress}
          showsUserLocation
          showsIndoors={false}
          customMapStyle={MAPS_STYLE}
          scrollEnabled
          ref={ref}
          toolbarEnabled={false}
          cacheEnabled={false}
          loadingEnabled
          loadingBackgroundColor="#000"
          loadingIndicatorColor="#ccc"
          onRegionChangeComplete={onRegionChange}>
          <MapComponents
            selectedId={selectedId}
            circles={circles}
            displayCircles={displayCircles}
            onPressPin={Platform.select({
              web: handleMarkerPress,
              ios: onPressPin,
              andorid: onPressPin,
            })}
            pins={pins}
          />
        </MapViewComponent>

        <View pointerEvents="box-none" style={styles.overlay}>
          {children}
        </View>
      </View>
    );
  },
);
