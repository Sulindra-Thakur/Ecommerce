import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { buildApiUrl } from "../../../lib/api";

const initialState = {
  isLoading: false,
  searchResults: [],
  error: null
};

// General keyword search
export const getSearchResults = createAsyncThunk(
  "/shop/getSearchResults",
  async (keyword, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        buildApiUrl(`/api/shop/search/${encodeURIComponent(keyword)}`)
      );
      
      return response.data;
    } catch (error) {
      console.error("Search error:", error);
      return rejectWithValue(error.response?.data || { message: "Failed to search products" });
    }
  }
);

// Category-specific search
export const searchByCategory = createAsyncThunk(
  "/shop/searchByCategory",
  async (category, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        buildApiUrl(`/api/shop/search/category/${encodeURIComponent(category)}`)
      );
      
      return response.data;
    } catch (error) {
      console.error("Category search error:", error);
      return rejectWithValue(error.response?.data || { message: "Failed to search category" });
    }
  }
);

// Brand-specific search
export const searchByBrand = createAsyncThunk(
  "/shop/searchByBrand",
  async (brand, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        buildApiUrl(`/api/shop/search/brand/${encodeURIComponent(brand)}`)
      );
      
      return response.data;
    } catch (error) {
      console.error("Brand search error:", error);
      return rejectWithValue(error.response?.data || { message: "Failed to search brand" });
    }
  }
);

const searchSlice = createSlice({
  name: "searchSlice",
  initialState,
  reducers: {
    resetSearchResults: (state) => {
      state.searchResults = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Keyword search
      .addCase(getSearchResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSearchResults.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.data || [];
        state.error = null;
      })
      .addCase(getSearchResults.rejected, (state, action) => {
        state.isLoading = false;
        state.searchResults = [];
        state.error = action.payload?.message || "Failed to search products";
      })
      
      // Category search
      .addCase(searchByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.data || [];
        state.error = null;
      })
      .addCase(searchByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.searchResults = [];
        state.error = action.payload?.message || "Failed to search by category";
      })
      
      // Brand search
      .addCase(searchByBrand.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchByBrand.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.data || [];
        state.error = null;
      })
      .addCase(searchByBrand.rejected, (state, action) => {
        state.isLoading = false;
        state.searchResults = [];
        state.error = action.payload?.message || "Failed to search by brand";
      });
  },
});

export const { resetSearchResults } = searchSlice.actions;

export default searchSlice.reducer;
