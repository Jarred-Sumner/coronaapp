import * as React from 'react';

export const MapContext = React.createContext<{
  moveMap: (opts: {
    latitude: number;
    longitude: number;
    altitude?: number;
  }) => void;
}>(null);
