import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { buildApiUrl } from "../../../lib/api";

const initialState = {
  isLoading: false,
  productList: [],
  error: null
};

export const addNewProduct = createAsyncThunk(
  "/products/addnewproduct",
  async (formData, { rejectWithValue }) => {
    try {
      const result = await axios.post(
        buildApiUrl("/api/admin/products/add"),
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return result?.data;
    } catch (error) {
      console.error("Error adding product:", error);
      return rejectWithValue(error.response?.data || { message: "Failed to add product" });
    }
  }
);

export const fetchAllProducts = createAsyncThunk(
  "/products/fetchAllProducts",
  async (_, { rejectWithValue }) => {
    try {
      const result = await axios.get(
        buildApiUrl("/api/admin/products/get")
      );
      return result?.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      return rejectWithValue(error.response?.data || { message: "Failed to fetch products" });
    }
  }
);

export const editProduct = createAsyncThunk(
  "/products/editProduct",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const result = await axios.put(
        buildApiUrl(`/api/admin/products/edit/${id}`),
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return result?.data;
    } catch (error) {
      console.error("Error editing product:", error);
      return rejectWithValue(error.response?.data || { message: "Failed to edit product" });
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "/products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const result = await axios.delete(
        buildApiUrl(`/api/admin/products/delete/${id}`)
      );
      return result?.data;
    } catch (error) {
      console.error("Error deleting product:", error);
      return rejectWithValue(error.response?.data || { message: "Failed to delete product" });
    }
  }
);

const AdminProductsSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productList = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.productList = [];
        state.error = action.payload?.message || "Failed to fetch products";
      })
      
      // Add product
      .addCase(addNewProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addNewProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(addNewProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to add product";
      })
      
      // Edit product
      .addCase(editProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to edit product";
      })
      
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to delete product";
      });
  },
});

export default AdminProductsSlice.reducer;
