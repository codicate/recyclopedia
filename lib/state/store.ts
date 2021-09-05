import {
  configureStore, combineReducers, createSlice,
  ThunkAction, Action
} from "@reduxjs/toolkit";
import { createWrapper, HYDRATE } from 'next-redux-wrapper';
import {
  persistStore, persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import articlesReducer from "./articles";
// import adminReducer from "./admin";
import adminReducer from "./strapi_test/admin";


const persistConfig = {
  key: "root",
  storage,
  whitelist: ["admin"]
};

const rootReducer = combineReducers({
  articles: articlesReducer,
  admin: adminReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);


const makeStore = () => configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [
        FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
        "articles/queryForArticles/fulfilled"
      ],
      ignoredPaths: ["articles.articlesData"]
    }
  })
});

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>;

export const wrapper = createWrapper<AppStore>(makeStore);


type CreateSliceParams = Parameters<typeof createSlice>[0];
export const createNextSlice = ({ extraReducers, ...params }: CreateSliceParams) => createSlice({
  ...params,
  extraReducers: {
    [HYDRATE]: (state, action) => {
      console.log('HYDRATE', state, action.payload);
      return {
        ...state as AppState,
        ...action.payload.some,
      };
    },
    ...extraReducers
  }
});


/*
NOTE(jerry):

Persist store, will not work unless we store additional information, and I only have enough
knowledge to know how to turn off the persistant store and understand that it is a persistant
store.

We just need to store the currently logged user credentials, and we can go from there. Basically
on app reinitialization we need to try to login using the existing credentials.

So now we don't really have a true or false anymore...
*/