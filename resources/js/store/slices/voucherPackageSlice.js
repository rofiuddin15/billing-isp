import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '../../utils/api';
import { toast } from 'react-toastify';

export const fetchVoucherPackages = createAsyncThunk(
    'voucherPackages/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await apiFetch('/api/voucher-packages');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteVoucherPackage = createAsyncThunk(
    'voucherPackages/delete',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            await apiFetch(`/api/voucher-packages/${id}`, { method: 'DELETE' });
            toast.success('Package deleted successfully');
            dispatch(fetchVoucherPackages());
            return id;
        } catch (error) {
            toast.error(error.message);
            return rejectWithValue(error.message);
        }
    }
);

const voucherPackageSlice = createSlice({
    name: 'voucherPackages',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchVoucherPackages.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchVoucherPackages.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchVoucherPackages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default voucherPackageSlice.reducer;
