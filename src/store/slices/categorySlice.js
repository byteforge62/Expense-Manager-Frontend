import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/Utils/axiosInstance";

/* Fetch */

export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async () => {
    const res = await axiosInstance.get("/categories");
    return res.data.data || res.data || [];
  },
);

/* Add */

export const addCategory = createAsyncThunk(
  "category/addCategory",
  async (data) => {
    const res = await axiosInstance.post("/categories", data);
    return res.data.data;
  },
);

/* Delete */

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (id) => {
    await axiosInstance.delete(`/categories/${id}`);
    return id;
  },
);

/* Update */

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ id, data }) => {
    const res = await axiosInstance.put(`/categories/${id}`, data);
    return res.data.data;
  },
);

const initialState = {
  categories: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: "category",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })

      .addCase(fetchCategories.rejected, (state) => {
        state.loading = false;
      })

      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => c._id !== action.payload,
        );
      })

      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (c) => c._id === action.payload._id,
        );

        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      });
  },
});

export default categorySlice.reducer;
