export const RNLocation = {
  requestPermission: () => Promise.resolve(true),
  getLatestLocation: () =>
    new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        return resolve(null);
      }
      globalThis.navigator?.geolocation?.getCurrentPosition(
        position => {
          resolve(position.coords);
        },
        err => {
          reject(err);
        },
        {timeout: 10000, enableHighAccuracy: false, maximumAge: 999},
      );
    }),
  subscribeToLocationUpdates: (cb, err = err => console.error(err)) => {
    if (typeof window === 'undefined') {
      return;
    }

    const watcher = globalThis.navigator?.geolocation?.watchPosition(
      ({coords, timestamp}) => {
        return cb([coords]);
      },
      err,
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 10,
      },
    );
    return function() {
      globalThis.navigator?.geolocation.clearWatch(watcher);
    };
  },
  configure: () => {},
};

export default RNLocation;
