import { createSlice } from "@reduxjs/toolkit";
import { loginSuccess, registerSuccess } from "./userRedux";

// Shoppers can fill a bag before signing in. Their lines live under this key
// and are folded into their own cart the moment they authenticate.
export const GUEST_CART = "guest";

// A cart line is one product in one size/colour combination, so the same shoe
// in two sizes has to occupy two lines rather than merging into one.
export const cartKeyFor = (product) =>
  `${product._id}|${product.selectedSize || ''}|${product.selectedColor || ''}`;

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    carts: {},
  },
  reducers: {
    addProduct: (state, action) => {
      const { userId, product } = action.payload;
      if (!state.carts[userId]) {
        state.carts[userId] = { products: {}, quantity: 0, total: 0 };
      }
      const userCart = state.carts[userId];
      const cartKey = cartKeyFor(product);
      if (userCart.products[cartKey]) {
        userCart.products[cartKey].quantity += product.quantity;
      } else {
        userCart.products[cartKey] = { ...product, cartKey };
      }
      userCart.quantity += product.quantity;
      userCart.total += product.price * product.quantity;
      console.log('Updated cart state:', state);
    },
    updateProductQuantity: (state, action) => {
      const { userId, cartKey, quantity } = action.payload;
      const userCart = state.carts[userId];
      if (userCart && userCart.products[cartKey]) {
        const product = userCart.products[cartKey];
        const quantityDiff = quantity - product.quantity;
        product.quantity = quantity;
        userCart.quantity += quantityDiff;
        userCart.total += product.price * quantityDiff;
      }
      console.log('Updated cart state:', state);
    },
    removeProduct: (state, action) => {
      const { userId, cartKey } = action.payload;
      const userCart = state.carts[userId];
      if (userCart && userCart.products[cartKey]) {
        const product = userCart.products[cartKey];
        userCart.quantity -= product.quantity;
        userCart.total -= product.price * product.quantity;
        delete userCart.products[cartKey];
      }
    },
    clearCart: (state, action) => {
      const { userId } = action.payload;
      if (state.carts[userId]) {
        state.carts[userId] = { products: {}, quantity: 0, total: 0 };
      }
    },
  },
  extraReducers: (builder) => {
    const mergeGuestCart = (state, action) => {
      const userId = action.payload?.id;
      const guestCart = state.carts[GUEST_CART];
      if (!userId || !guestCart) {
        return;
      }
      if (!state.carts[userId]) {
        state.carts[userId] = { products: {}, quantity: 0, total: 0 };
      }
      const userCart = state.carts[userId];
      Object.values(guestCart.products).forEach((item) => {
        if (userCart.products[item.cartKey]) {
          userCart.products[item.cartKey].quantity += item.quantity;
        } else {
          userCart.products[item.cartKey] = { ...item };
        }
        userCart.quantity += item.quantity;
        userCart.total += item.price * item.quantity;
      });
      delete state.carts[GUEST_CART];
    };
    builder.addCase(loginSuccess, mergeGuestCart);
    builder.addCase(registerSuccess, mergeGuestCart);
  },
});

export const { addProduct, updateProductQuantity, removeProduct, clearCart } = cartSlice.actions;
export default cartSlice.reducer;