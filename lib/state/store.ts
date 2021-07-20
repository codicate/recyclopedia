import { configureStore, ThunkAction, Action, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore, persistReducer,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import articlesReducer from "./articles";
import adminReducer from "./admin";


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


export const store = configureStore({
  reducer: persistedReducer,
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

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;


/*
NOTE(jerry):

Persist store, will not work unless we store additional information, and I only have enough
knowledge to know how to turn off the persistant store and understand that it is a persistant
store.

We just need to store the currently logged user credentials, and we can go from there. Basically
on app reinitialization we need to try to login using the existing credentials.

So now we don't really have a true or false anymore...
*/