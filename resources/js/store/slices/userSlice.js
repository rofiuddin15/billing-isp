import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '../../utils/api';
import { toast } from 'react-toastify';

export const fetchUsers = createAsyncThunk(
    'users/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            return await apiFetch('/api/users');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchRoles = createAsyncThunk(
    'users/fetchRoles',
    async (_, { rejectWithValue }) => {
        try {
            return await apiFetch('/api/roles');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const userSlice = createSlice({
    name: 'users',
    initialState: {
        items: [],
        roles: [],
        loading: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.roles = action.payload;
            });
    },
});

export default userSlice.reducer;
