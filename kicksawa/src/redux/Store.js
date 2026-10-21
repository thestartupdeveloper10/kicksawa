import { configureStore, combineReducers } from "@reduxjs/toolkit";
import cartReducer from "./cartRedux";
import userReducer from "./userRedux";
import wishlistReducer from "./wishlistRedux";
import { cartKeyFor } from "./cartRedux";
import {
  persistStore,
  persistReducer,
  createMigrate,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

// v1 stored each wishlist entry as { userId, product }; v2 stores the product
// itself, so entries saved before the change have to be unwrapped on rehydrate.
const migrations = {
  2: (state) => {
    if (!state || !state.wishlist || !state.wishlist.wishlists) {
      return state;
    }
    const wishlists = {};
    Object.entries(state.wishlist.wishlists).forEach(([userId, list]) => {
      wishlists[userId] = {
        ...list,
        products: (list.products || []).map((entry) =>
          entry && entry.product ? entry.product : entry
        ),
      };
    });
    return { ...state, wishlist: { ...state.wishlist, wishlists } };
  },
  // v2 keyed cart lines by product id alone, which merged the same shoe in
  // different sizes into one line; v3 keys them by product + size + colour.
  3: (state) => {
    if (!state || !state.cart || !state.cart.carts) {
      return state;
    }
    const carts = {};
    Object.entries(state.cart.carts).forEach(([userId, cart]) => {
      const products = {};
      Object.values(cart.products || {}).forEach((item) => {
        const cartKey = cartKeyFor(item);
        products[cartKey] = { ...item, cartKey };
      });
      carts[userId] = { ...cart, products };
    });
    return { ...state, cart: { ...state.cart, carts } };
  },
};

const persistConfig = {
  key: "root",
  version: 3,
  storage,
  migrate: createMigrate(migrations),
};

const rootReducer = combineReducers({ user: userReducer, cart: cartReducer, wishlist: wishlistReducer });

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export let persistor = persistStore(store);