import { createSlice } from "@reduxjs/toolkit";

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
      if (userCart.products[product._id]) {
        userCart.products[product._id].quantity += product.quantity;
      } else {
        userCart.products[product._id] = { ...product };
      }
      userCart.quantity += product.quantity;
      userCart.total += product.price * product.quantity;
      console.log('Updated cart state:', state);
    },
    updateProductQuantity: (state, action) => {
      const { userId, productId, quantity } = action.payload;
      const userCart = state.carts[userId];
      if (userCart && userCart.products[productId]) {
        const product = userCart.products[productId];
        const quantityDiff = quantity - product.quantity;
        product.quantity = quantity;
        userCart.quantity += quantityDiff;
        userCart.total += product.price * quantityDiff;
      }
      console.log('Updated cart state:', state);
    },
    removeProduct: (state, action) => {
      const { userId, productId } = action.payload;
      const userCart = state.carts[userId];
      if (userCart && userCart.products[productId]) {
        const product = userCart.products[productId];
        userCart.quantity -= product.quantity;
        userCart.total -= product.price * product.quantity;
        delete userCart.products[productId];
      }
      console.log('Updated cart state:', state);
    },
    clearCart: (state, action) => {
      const { userId } = action.payload;
      if (state.carts[userId]) {
        state.carts[userId] = { products: {}, quantity: 0, total: 0 };
      }
      console.log('Cleared cart for user:', userId);
    },
  },
});

export const { addProduct, updateProductQuantity, removeProduct, clearCart } = cartSlice.actions;
export default cartSlice.reducer;