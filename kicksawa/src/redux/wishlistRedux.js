import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  wishlists: {}, // Object to store wishlists for different users
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addProductWishlist: (state, action) => {
      const { userId } = action.payload;
      if (!state.wishlists[userId]) {
        state.wishlists[userId] = {
          products: [],
          wishQuantity: 0,
        };
      }
      state.wishlists[userId].wishQuantity += 1;
      state.wishlists[userId].products.push(action.payload);
    },
    removeProductWishlist: (state, action) => {
      const { userId, productId } = action.payload;
      if (state.wishlists[userId]) {
        const productIndex = state.wishlists[userId].products.findIndex(
          (product) => product.product._id === productId
        );
        if (productIndex !== -1) {
          state.wishlists[userId].wishQuantity -= 1;
          state.wishlists[userId].products.splice(productIndex, 1);
        }
      }
    },
  },
});

export const { addProductWishlist, removeProductWishlist } = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (state, userId) =>
  state.wishlist.wishlists[userId] || { products: [], wishQuantity: 0 };

export default wishlistSlice.reducer;
