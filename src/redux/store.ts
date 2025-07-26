import { combineReducers, configureStore } from "@reduxjs/toolkit";

import layoutSlice from "@/redux/slices/layoutSlice";

import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import searchSlice from "@/redux/slices/searchSlice";

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const reducer = combineReducers({
  layout: layoutSlice,
  search: searchSlice,
});

const persistedReducers = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducers,
  // reducer: {
  //   currentWebsite: currentWebsiteSlice,
  //   layout: layoutSlice,
  //   articleGen: articleGenSlice,
  //   addSiteForm: addSiteFormSlice,
  //   articlePublish: articlePublishSlice,
  // },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
