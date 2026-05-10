import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '../../utils/api';
import { toast } from 'react-toastify';

export const fetchAccounts = createAsyncThunk(
    'accounts/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await apiFetch('/api/accounts');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchAllAccounts = createAsyncThunk(
    'accounts/fetchAllFlat',
    async (_, { rejectWithValue }) => {
        try {
            return await apiFetch('/api/accounts/all');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const accountSlice = createSlice({
    name: 'accounts',
    initialState: {
        tree: [],
        all: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAccounts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAccounts.fulfilled, (state, action) => {
                state.loading = false;
                state.tree = action.payload;
            })
            .addCase(fetchAllAccounts.fulfilled, (state, action) => {
                state.all = action.payload;
            });
    },
});

export default accountSlice.reducer;
