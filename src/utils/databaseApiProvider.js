import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from 'app/hooks';
import { initApi, selectApi } from 'app/apiSlice';


function databaseApiProvider(App) {
  return () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
      dispatch(initApi());
    }, [dispatch]);

    const { status, api } = useAppSelector(selectApi);
    console.log('api', api);

    return () => {
      switch (status) {
        case 'idle':
          return <p>Please wait! Loading Recyclopedia...</p>;
        case 'failed':
          return <p>MongoDB is probably offline. Crap.</p>;
        case 'suceed':
          return <App api={api} />;
        default: return;
      }
    };
  };
}

export default databaseApiProvider;
