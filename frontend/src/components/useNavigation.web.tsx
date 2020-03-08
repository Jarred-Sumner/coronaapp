import Router from 'next/router';
import React, {useCallback} from 'react';

const goBack = () => Router.back();

export default function useNavigation() {
  const navigate = useCallback((route: string, params: any) => {
    Router.push(
      {
        pathname: `/`,
        query: {...(params ?? {})},
      },
      route.web?.as,
    );
  }, []);

  return {
    navigate,
    push: navigate,
    goBack,
  };
}
