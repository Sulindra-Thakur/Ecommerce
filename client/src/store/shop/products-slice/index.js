import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { buildApiUrl } from "../../../lib/api";

const initialState = {
  isLoading: false,
  productList: [],
  productDetails: null,
  weatherData: null,
};

export const fetchAllFilteredProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async ({ filterParams, sortParams, locationData }) => {
    console.log(fetchAllFilteredProducts, "fetchAllFilteredProducts");

    const query = new URLSearchParams({
      ...filterParams,
      sortBy: sortParams,
      ...(locationData ? { latitude: locationData.latitude, longitude: locationData.longitude } : {})
    });

    const result = await axios.get(
      buildApiUrl(`/api/shop/products/get?${query}`)
    );

    console.log(result);

    return result?.data;
  }
);

export const fetchProductDetails = createAsyncThunk(
  "/products/fetchProductDetails",
  async ({ id, locationData }) => {
    const query = new URLSearchParams(
      locationData ? { latitude: locationData.latitude, longitude: locationData.longitude } : {}
    );
    
    const result = await axios.get(
      buildApiUrl(`/api/shop/products/get/${id}${query.toString() ? `?${query}` : ''}`)
    );

    return result?.data;
  }
);

const shoppingProductSlice = createSlice({
  name: "shoppingProducts",
  initialState,
  reducers: {
    setProductDetails: (state) => {
      state.productDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredProducts.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
        state.weatherData = action.payload.weather;
      })
      .addCase(fetchAllFilteredProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
      })
      .addCase(fetchProductDetails.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productDetails = action.payload.data;
        state.weatherData = action.payload.weather;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.productDetails = null;
      });
  },
});

export const { setProductDetails } = shoppingProductSlice.actions;

export default shoppingProductSlice.reducer;
