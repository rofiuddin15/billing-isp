import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '../../utils/api';
import { toast } from 'react-toastify';

export const fetchCustomers = createAsyncThunk(
    'customers/fetchAll',
    async ({ page = 1, per_page = 10, search = '' }, { rejectWithValue }) => {
        try {
            return await apiFetch(`/api/customers?page=${page}&per_page=${per_page}&search=${search}`);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createCustomer = createAsyncThunk(
    'customers/create',
    async (customerData, { rejectWithValue }) => {
        try {
            const data = await apiFetch('/api/customers', {
                method: 'POST',
                body: JSON.stringify(customerData),
            });
            toast.success('Customer created successfully');
            return data;
        } catch (error) {
            toast.error(error.message);
            return rejectWithValue(error.message);
        }
    }
);

export const updateCustomer = createAsyncThunk(
    'customers/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const result = await apiFetch(`/api/customers/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            toast.success('Customer updated successfully');
            return result;
        } catch (error) {
            toast.error(error.message);
            return rejectWithValue(error.message);
        }
    }
);

export const deleteCustomer = createAsyncThunk(
    'customers/delete',
    async (id, { dispatch, rejectWithValue }) => {
        try {
            await apiFetch(`/api/customers/${id}`, {
                method: 'DELETE',
            });
            toast.success('Customer deleted successfully');
            dispatch(fetchCustomers({ page: 1 }));
            return id;
        } catch (error) {
            toast.error(error.message);
            return rejectWithValue(error.message);
        }
    }
);

const customerSlice = createSlice({
    name: 'customers',
    initialState: {
        items: [],
        loading: false,
        error: null,
        pagination: {
            currentPage: 1,
            lastPage: 1,
            total: 0,
        },
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCustomers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload.data;
                state.pagination = {
                    currentPage: action.payload.current_page,
                    lastPage: action.payload.last_page,
                    total: action.payload.total,
                };
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default customerSlice.reducer;
