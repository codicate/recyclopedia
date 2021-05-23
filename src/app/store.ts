import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';

import articlesReducer from 'app/articlesSlice';

export const store = configureStore({
  reducer: {
    articles: articlesReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [
        'articles/queryForArticles/fulfilled'
      ],
      ignoredPaths: ['articles.articlesData']
    }
  })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
