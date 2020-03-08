import React, {Component} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {
  GoogleMap,
  useLoadScript,
  Marker as MapsMarker,
} from '@react-google-maps/api';
import {isDesktop} from './ScreenSize';
import {unstable_batchedUpdates} from 'react-dom';
import {MAPS_STYLE} from './MAPS_STYLE';

export const Marker = ({
  image: {uri, width, height},
  onPress,
  identifier,
  coordinate: {latitude, longitude},
  ...rest
}) => {
  const handlePress = React.useCallback(
    (event: google.maps.MouseEvent) => {
      const latitude = event.latLng.lat();
      const longitude = event.latLng.lng();
      event.stop();
      unstable_batchedUpdates(() => {
        onPress &&
          onPress({
            nativeEvent: {
              id: identifier,
              coodinate: {latitude, longitude},
            },
          });
      });
    },
    [identifier, onPress],
  );

  const markerImage = React.useMemo(() => {
    return new window.google.maps.MarkerImage(
      uri,
      new window.google.maps.Size(width, height),
      new window.google.maps.Point(0, 0),
      new window.google.maps.Point(width / 2, height / 2),
      new window.google.maps.Size(width, height),
    );
  }, [uri, width, height]);
  return (
    <MapsMarker
      {...rest}
      icon={markerImage}
      clickable={!!onPress}
      onClick={handlePress}
      position={{lat: latitude, lng: longitude}}
    />
  );
};

const toRadians = degrees => degrees * (Math.PI / 180);
const MIN_ZOOM = 2;
const MAX_ZOOM = 18;

const zoomToAltitude = zoom => {
  //this equation is a transformation of the angular size equation solving for D. See: http://en.wikipedia.org/wiki/Forced_perspective

  let firstPartOfEq =
    0.05 *
    (591657550.5 /
      Math.pow(2, Math.max(Math.min(zoom, MAX_ZOOM), MIN_ZOOM) - 1) /
      2); //amount displayed is .05 meters and map scale =591657550.5/(Math.pow(2,(mapzoom-1))))
  //this bit ^ essentially gets the h value in the angular size eq then divides it by 2

  return (
    firstPartOfEq *
    (Math.cos(toRadians(85.362 / 2)) / Math.sin(toRadians(85.362 / 2)))
  ); //85.362 is angle which google maps displays on a 5cm wide screen
};

const altitudeToZoom = range => {
  return Math.floor(
    Math.min(
      Math.max(Math.round(Math.log(35200000 / range) / Math.log(2)), MIN_ZOOM),
      MAX_ZOOM,
    ),
  );
};

const GoogleMapsContainer = ({
  children,
  onLoad: _onLoad,
  options,
  containerElement,
  mapElement,
  loadingElement,
  ...props
}) => {
  const onLoad = React.useCallback(
    map => {
      console.log(map);
      _onLoad && _onLoad(map);
    },
    [_onLoad],
  );

  const libraries = React.useRef(['geometry', 'drawing', 'places']);

  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: 'AIzaSyA2dXLRCMyyhFHSQQAE0zvXSHYK1x0Svk8',

    libraries: libraries.current,
  });

  return isLoaded ? (
    <GoogleMap
      {...props}
      mapContainerStyle={{height: '100%'}}
      id="map"
      options={options}
      onLoad={onLoad}>
      {children}
    </GoogleMap>
  ) : (
    loadingElement
  );
};

class MapView extends Component {
  constructor(props) {
    super(props);

    this.defaultCenter = {
      lat: props.initialRegion.latitude,
      lng: props.initialRegion.longitude,
    };

    this.defaultZoom = altitudeToZoom(props.initialRegion?.altitude ?? 0);

    this.state = {
      center: null,
    };
  }

  map: google.maps.Map | null;

  handleMapMounted = map => {
    this.map = map;
    this.props.onMapReady && this.props.onMapReady();
  };

  animateCameraFrame: number | null = null;

  animateCamera({center: {latitude, longitude} = {}, altitude}) {
    if (this.animateCameraFrame) {
      window.cancelAnimationFrame(this.animateCameraFrame);
    }

    this.animateCameraFrame = window.requestAnimationFrame(() => {
      if (typeof altitude === 'number') {
        const zoom = altitudeToZoom(altitude);
        console.log({zoom});

        this.setZoom(zoom);
      }

      if (latitude && longitude) {
        this.map?.panTo(new global.google.maps.LatLng(latitude, longitude));
      }

      this.animateCameraFrame = null;
    });
  }

  componentWillUnmount() {
    if (this.animateCameraFrame) {
      window.cancelAnimationFrame(this.animateCameraFrame);
    }
  }

  setZoom = zoom => this.map.setZoom(zoom);

  onDragEnd = () => {
    const {onRegionChangeComplete} = this.props;
    if (this.map && onRegionChangeComplete) {
      const center = this.map.getCenter();
      const zoom = this.map.getZoom();
      const coords = {
        latitude: center.lat(),
        longitude: center.lng(),
        altitude: zoomToAltitude(zoom),
      };

      unstable_batchedUpdates(() => {
        onRegionChangeComplete(coords);
      });
    }
  };

  onClick = (event: google.maps.MouseEvent) => {
    let mapEvent = {
      nativeEvent: {
        coordinate: {
          latitude: event.latLng.lat(),
          longitude: event.latLng.lng(),
        },
      },
    };

    unstable_batchedUpdates(() => {
      this.props.onPress(mapEvent);
      mapEvent = null;
    });
  };

  options = {
    styles: MAPS_STYLE,
    disableDefaultUI: true,
    zoomControl: isDesktop,
    clickableIcons: false,
  };

  render() {
    const {region, initialRegion, onRegionChange, onPress} = this.props;
    const {center} = this.state;
    const style = this.props.style || styles.container;

    return (
      <View style={style}>
        <GoogleMapsContainer
          onLoad={this.handleMapMounted}
          containerElement={<div style={{height: '100%'}} />}
          mapElement={<div style={{height: '100%'}} />}
          loadingElement={<div style={{height: '100%'}} />}
          onDragStart={onRegionChange}
          center={this.defaultCenter}
          onIdle={this.onDragEnd}
          zoom={this.defaultZoom}
          onClick={this.onClick}
          options={this.options}>
          {this.props.children}
        </GoogleMapsContainer>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
});

export default MapView;
