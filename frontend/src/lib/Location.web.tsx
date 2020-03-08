export const RNLocation = {
  requestPermission: () => Promise.resolve(true),
  getLatestLocation: () =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
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
    const watcher = navigator.geolocation.watchPosition(
      ({coords, timestamp}) => {
        return [coords];
      },
      err,
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 10,
      },
    );
    return function() {
      navigator.geolocation.clearWatch(watcher);
    };
  },
  configure: () => {},
};

export default RNLocation;
