import { createSlice } from "@reduxjs/toolkit";

const savedData = localStorage.getItem("cart");

const initialState = {
  cartItems: savedData ? JSON.parse(savedData) : [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newProduct = {
        ...action.payload,
        variantId: action.payload.variantId || null,
        variantSize: action.payload.variantSize || null,
      };

      // Unique key = productId + variantId + size
      const existingProduct = state.cartItems.find(
        (product) =>
          product._id === newProduct._id &&
          product.variantId === newProduct.variantId &&
          product.variantSize === newProduct.variantSize
      );

      if (existingProduct) {
        // Increase quantity if stock allows
        state.cartItems = state.cartItems.map((product) =>
          product._id === newProduct._id &&
          product.variantId === newProduct.variantId &&
          product.variantSize === newProduct.variantSize
            ? { ...product, qty: product.qty + newProduct.qty }
            : product
        );
      } else {
        state.cartItems.push(newProduct);
      }

      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },

    updateCart: (state, action) => {
      const { _id, variantId = null, variantSize = null, qty } = action.payload;

      const existingProduct = state.cartItems.find(
        (product) =>
          product._id === _id &&
          product.variantId === variantId &&
          product.variantSize === variantSize
      );

      if (existingProduct) {
        if (qty === 0) {
          state.cartItems = state.cartItems.filter(
            (product) =>
              !(
                product._id === _id &&
                product.variantId === variantId &&
                product.variantSize === variantSize
              )
          );
        } else {
          state.cartItems = state.cartItems.map((product) =>
            product._id === _id &&
            product.variantId === variantId &&
            product.variantSize === variantSize
              ? { ...product, qty }
              : product
          );
        }
      }

      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },

    removeFromCart: (state, action) => {
      const { _id, variantId = null, variantSize = null } = action.payload;
      state.cartItems = state.cartItems.filter(
        (product) =>
          !(
            product._id === _id &&
            product.variantId === variantId &&
            product.variantSize === variantSize
          )
      );
      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },

    clearCart: (state) => {
      state.cartItems = [];
      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },
  },
});

export const { addToCart, removeFromCart, clearCart, updateCart } = cartSlice.actions;
export default cartSlice.reducer;
