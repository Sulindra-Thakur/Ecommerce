import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { buildApiUrl } from "../../lib/api";

// Track user's product view
export const trackProductView = createAsyncThunk(
  "recommendation/trackView",
  async ({ userId, productId }) => {
    try {
      const response = await axios.post(
        buildApiUrl("/api/shop/recommendation/track-view"),
        { userId, productId }
      );
      return response.data;
    } catch (error) {
      console.error("Error tracking product view:", error);
      return { success: false };
    }
  }
);

// Track user's search query
export const trackSearchQuery = createAsyncThunk(
  "recommendation/trackSearch",
  async ({ userId, query }) => {
    try {
      const response = await axios.post(
        buildApiUrl("/api/shop/recommendation/track-search"),
        { userId, query }
      );
      return response.data;
    } catch (error) {
      console.error("Error tracking search query:", error);
      return { success: false };
    }
  }
);

// Get personalized recommendations for user
export const getPersonalizedRecommendations = createAsyncThunk(
  "recommendation/getPersonalized",
  async ({ userId, limit = 8, locationData }, { rejectWithValue }) => {
    try {
      // If userId is undefined, null, or 'trending', get trending recommendations
      const isValidUserId = userId && userId !== 'undefined' && userId !== 'null' && userId !== 'trending';
      
      let url = buildApiUrl(`/api/shop/recommendation/user/${isValidUserId ? userId : 'trending'}?limit=${limit}`);
      
      // Add weather data if available
      if (locationData && locationData.weatherData) {
        url += `&weatherData=${encodeURIComponent(JSON.stringify(locationData.weatherData))}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error getting personalized recommendations:", error);
      return rejectWithValue(error.response?.data || { success: false, message: "Failed to get recommendations" });
    }
  }
);

// Get similar products
export const getSimilarProducts = createAsyncThunk(
  "recommendation/getSimilar",
  async ({ productId, limit = 4 }) => {
    try {
      const response = await axios.get(
        buildApiUrl(`/api/shop/recommendation/similar/${productId}?limit=${limit}`)
      );
      return response.data;
    } catch (error) {
      console.error("Error getting similar products:", error);
      return { success: false, data: [] };
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  personalizedRecommendations: [],
  similarProducts: [],
  recommendationType: null,
  userPreferences: null
};

const recommendationSlice = createSlice({
  name: "recommendation",
  initialState,
  reducers: {
    clearRecommendations: (state) => {
      state.personalizedRecommendations = [];
      state.similarProducts = [];
    }
  },
  extraReducers: (builder) => {
    // Handle getPersonalizedRecommendations
    builder.addCase(getPersonalizedRecommendations.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getPersonalizedRecommendations.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.success) {
        state.personalizedRecommendations = action.payload.data;
        state.recommendationType = action.payload.recommendationType;
        state.userPreferences = action.payload.preferences;
      } else {
        state.error = "Failed to get recommendations";
      }
    });
    builder.addCase(getPersonalizedRecommendations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // Handle getSimilarProducts
    builder.addCase(getSimilarProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getSimilarProducts.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.success) {
        state.similarProducts = action.payload.data;
      } else {
        state.error = "Failed to get similar products";
      }
    });
    builder.addCase(getSimilarProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  }
});

export const { clearRecommendations } = recommendationSlice.actions;
export default recommendationSlice.reducer; 