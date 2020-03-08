import * as React from 'react';
import {getName} from '../lib/getCountry';

export type CountryContextType = {
  country: string;
  label: string;
  countryCode: string;
  setCountry: (country: string, countryCode: string) => void;
};

export const CountryContext = React.createContext<CountryContextType>(null);

export const CountryProvider = ({children}) => {
  const [country, setCountry] = React.useState('World');
  const [label, setLabel] = React.useState('World');
  const [countryCode, setCountryCode] = React.useState('World');

  const _setCountry = React.useCallback(
    (country: string, countryCode: string) => {
      setCountry(country);
      setCountryCode(countryCode);
      setLabel(getName(countryCode));
    },
    [setCountry, setCountryCode, setLabel],
  );

  const contextValue = React.useMemo(
    () => ({
      country,
      setCountry: _setCountry,
      label,
      countryCode,
    }),
    [country, countryCode, _setCountry, setCountry, label],
  );

  return (
    <CountryContext.Provider value={contextValue}>
      {children}
    </CountryContext.Provider>
  );
};
