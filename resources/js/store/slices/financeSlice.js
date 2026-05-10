import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '../../utils/api';
import { toast } from 'react-toastify';

export const fetchCashFlows = createAsyncThunk(
    'finance/fetchCashFlows',
    async ({ page = 1, per_page = 10, type = '', search = '' }, { rejectWithValue }) => {
        try {
            return await apiFetch(`/api/cash-flow?page=${page}&per_page=${per_page}&type=${type}&search=${search}`);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchFinanceStats = createAsyncThunk(
    'finance/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            return await apiFetch('/api/cash-flow/stats');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addCashFlowEntry = createAsyncThunk(
    'finance/addEntry',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiFetch('/api/cash-flow', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            toast.success('Transaction recorded');
            dispatch(fetchCashFlows({ page: 1 }));
            dispatch(fetchFinanceStats());
            return response;
        } catch (error) {
            toast.error(error.message);
            return rejectWithValue(error.message);
        }
    }
);

const financeSlice = createSlice({
    name: 'finance',
    initialState: {
        entries: [],
        stats: {
            total_income: 0,
            total_expense: 0,
            balance: 0,
        },
        loading: false,
        pagination: {
            currentPage: 1,
            lastPage: 1,
            total: 0,
        },
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCashFlows.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCashFlows.fulfilled, (state, action) => {
                state.loading = false;
                state.entries = action.payload.data;
                state.pagination = {
                    currentPage: action.payload.current_page,
                    lastPage: action.payload.last_page,
                    total: action.payload.total,
                };
            })
            .addCase(fetchFinanceStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            });
    },
});

export default financeSlice.reducer;
