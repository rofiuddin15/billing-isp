import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '../../utils/api';
import { toast } from 'react-toastify';

export const fetchPackages = createAsyncThunk(
    'packages/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await apiFetch('/api/monthly-packages');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deletePackage = createAsyncThunk(
    'packages/delete',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            await apiFetch(`/api/monthly-packages/${id}`, { method: 'DELETE' });
            toast.success('Package deleted successfully');
            dispatch(fetchPackages());
            return id;
        } catch (error) {
            toast.error(error.message);
            return rejectWithValue(error.message);
        }
    }
);

const packageSlice = createSlice({
    name: 'packages',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPackages.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPackages.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchPackages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default packageSlice.reducer;
