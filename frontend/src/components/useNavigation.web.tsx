import Router from 'next/router';
import React, {useCallback} from 'react';
import {useRouter} from 'next/router';
import {merge} from 'lodash';
import {MAPPINGS} from '../lib/Routes.web';

const goBack = () => Router.back();

export function useNavigation() {
  const {query, replace, pathname} = useRouter();

  const navigate = useCallback((route: string, params: any) => {
    Router.push({
      pathname: MAPPINGS[route],
      query: {...(params ?? {})},
    });
  }, []);

  const setParams = useCallback((params: Object) => {
    replace({
      pathname: Router.pathname,
      query: merge({}, Router.query, params),
    });
  }, []);

  return {
    navigate,
    setParams,
    params: query,
    push: navigate,
    goBack,
  };
}

export {useNavigation as useRoute};

export default useNavigation;
