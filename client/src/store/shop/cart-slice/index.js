import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { buildApiUrl } from "../../../lib/api";

const initialState = {
  cartItems: [],
  isLoading: false,
  weatherData: null,
};

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ userId, productId, quantity }) => {
    // Validate userId to prevent MongoDB casting errors
    if (!userId || typeof userId !== 'string' || userId.length !== 24) {
      console.log("Invalid user ID for adding to cart, returning empty cart");
      return { success: true, data: { items: [] } };
    }
    
    try {
      const response = await axios.post(
        buildApiUrl("/api/shop/cart/add"),
        {
          userId,
          productId,
          quantity,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Return empty cart on error to prevent UI issues
      return { success: true, data: { items: [] } };
    }
  }
);

export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (userId) => {
    if (!userId || userId === 'undefined' || userId === 'null' || typeof userId !== 'string' || userId.length !== 24) {
      // Return empty cart if no valid user ID
      console.log("Invalid or missing user ID, returning empty cart");
      return { success: true, data: { items: [] } };
    }
    
    try {
      const response = await axios.get(
        buildApiUrl(`/api/shop/cart/get/${userId}`)
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching cart items:", error);
      // Return empty cart on error to prevent UI issues
      return { success: true, data: { items: [] } };
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ userId, productId }) => {
    // Validate userId to prevent MongoDB casting errors
    if (!userId || typeof userId !== 'string' || userId.length !== 24) {
      console.log("Invalid user ID for delete cart item, returning empty cart");
      return { success: true, data: { items: [] } };
    }
    
    try {
      const response = await axios.delete(
        buildApiUrl(`/api/shop/cart/${userId}/${productId}`)
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting cart item:", error);
      // Return empty cart on error to prevent UI issues
      return { success: true, data: { items: [] } };
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ userId, productId, quantity }) => {
    // Validate userId to prevent MongoDB casting errors
    if (!userId || typeof userId !== 'string' || userId.length !== 24) {
      console.log("Invalid user ID for updating cart quantity, returning empty cart");
      return { success: true, data: { items: [] } };
    }
    
    try {
      const response = await axios.put(
        buildApiUrl("/api/shop/cart/update-cart"),
        {
          userId,
          productId,
          quantity,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      // Return empty cart on error to prevent UI issues
      return { success: true, data: { items: [] } };
    }
  }
);

// Add clearCart function to empty cart after payment
export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (userId) => {
    // Enhanced validation to prevent invalid IDs from being sent
    if (!userId || typeof userId !== 'string' || userId.length !== 24) {
      console.log("Invalid user ID for cart clearing, returning empty cart");
      return { success: true, data: { items: [] } };
    }
    
    try {
      const response = await axios.delete(
        buildApiUrl(`/api/shop/cart/clear/${userId}`)
      );
      return response.data;
    } catch (error) {
      console.error("Error clearing cart:", error);
      // Return empty cart on error to prevent UI issues
      return { success: true, data: { items: [] } };
    }
  }
);

const shoppingCartSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    resetCart: (state) => {
      state.cartItems = [];
      state.isLoading = false;
      state.weatherData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(addToCart.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      .addCase(fetchCartItems.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
        state.weatherData = action.payload.data?.weather || null;
      })
      .addCase(fetchCartItems.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      .addCase(updateCartQuantity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(updateCartQuantity.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      .addCase(deleteCartItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cartItems = action.payload.data;
      })
      .addCase(deleteCartItem.rejected, (state) => {
        state.isLoading = false;
        state.cartItems = [];
      })
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false;
        state.cartItems = { items: [] };
        state.weatherData = null;
      })
      .addCase(clearCart.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { resetCart } = shoppingCartSlice.actions;
export default shoppingCartSlice.reducer;
