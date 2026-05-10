import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '../../utils/api';
import { toast } from 'react-toastify';

export const fetchVoucherPackages = createAsyncThunk(
    'vouchers/fetchPackages',
    async (_, { rejectWithValue }) => {
        try {
            return await apiFetch('/api/voucher-packages');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchVouchers = createAsyncThunk(
    'vouchers/fetchAll',
    async ({ page = 1, per_page = 10, status = '', search = '' }, { rejectWithValue }) => {
        try {
            return await apiFetch(`/api/vouchers?page=${page}&per_page=${per_page}&status=${status}&search=${search}`);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const generateVouchers = createAsyncThunk(
    'vouchers/generate',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiFetch('/api/vouchers/generate', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            toast.success(response.message);
            dispatch(fetchVouchers({ page: 1 }));
            return response;
        } catch (error) {
            toast.error(error.message);
            return rejectWithValue(error.message);
        }
    }
);

export const sellVoucher = createAsyncThunk(
    'vouchers/sell',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiFetch(`/api/vouchers/${id}/sell`, {
                method: 'POST',
            });
            toast.success('Voucher sold successfully');
            dispatch(fetchVouchers({ page: 1 }));
            return response;
        } catch (error) {
            toast.error(error.message);
            return rejectWithValue(error.message);
        }
    }
);

const voucherSlice = createSlice({
    name: 'vouchers',
    initialState: {
        vouchers: [],
        packages: [],
        loading: false,
        packagesLoading: false,
        pagination: {
            currentPage: 1,
            lastPage: 1,
            total: 0,
        },
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchVoucherPackages.pending, (state) => {
                state.packagesLoading = true;
            })
            .addCase(fetchVoucherPackages.fulfilled, (state, action) => {
                state.packagesLoading = false;
                state.packages = action.payload;
            })
            .addCase(fetchVouchers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchVouchers.fulfilled, (state, action) => {
                state.loading = false;
                state.vouchers = action.payload.data;
                state.pagination = {
                    currentPage: action.payload.current_page,
                    lastPage: action.payload.last_page,
                    total: action.payload.total,
                };
            })
            .addCase(fetchVouchers.rejected, (state) => {
                state.loading = false;
            });
    },
});

export default voucherSlice.reducer;
