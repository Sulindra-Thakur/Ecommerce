import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { buildApiUrl } from "../../../lib/api";

const initialState = {
  isLoading: false,
  reviews: [],
  error: null,
};

export const addReview = createAsyncThunk(
  "/order/addReview",
  async (formdata, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        buildApiUrl("/api/shop/review/add"),
        formdata
      );
      return response.data;
    } catch (error) {
      console.error("Error adding review:", error);
      return rejectWithValue(error.response?.data || { success: false, message: "Failed to add review" });
    }
  }
);

export const getReviews = createAsyncThunk(
  "/order/getReviews", 
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        buildApiUrl(`/api/shop/review/${id}`)
      );
      return response.data;
    } catch (error) {
      console.error("Error getting reviews:", error);
      return rejectWithValue(error.response?.data || { success: false, message: "Failed to get reviews" });
    }
  }
);

const reviewSlice = createSlice({
  name: "reviewSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addReview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(addReview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to add review";
      })
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.data;
        state.error = null;
      })
      .addCase(getReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.reviews = [];
        state.error = action.payload?.message || "Failed to get reviews";
      });
  },
});

export default reviewSlice.reducer;
