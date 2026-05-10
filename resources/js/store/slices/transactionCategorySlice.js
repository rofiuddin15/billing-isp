import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '../../utils/api';
import { toast } from 'react-toastify';

export const fetchTransactionCategories = createAsyncThunk(
    'transactionCategories/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await apiFetch('/api/transaction-categories');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteTransactionCategory = createAsyncThunk(
    'transactionCategories/delete',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            await apiFetch(`/api/transaction-categories/${id}`, { method: 'DELETE' });
            toast.success('Category deleted successfully');
            dispatch(fetchTransactionCategories());
            return id;
        } catch (error) {
            toast.error(error.message);
            return rejectWithValue(error.message);
        }
    }
);

const transactionCategorySlice = createSlice({
    name: 'transactionCategories',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTransactionCategories.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTransactionCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchTransactionCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default transactionCategorySlice.reducer;
