import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiFetch from '../../utils/api';

export const fetchMe = createAsyncThunk('auth/fetchMe', async () => {
    return await apiFetch('/api/auth/me', { method: 'POST' });
});

const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    permissions: [],
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, access_token, permissions } = action.payload;
            state.user = user;
            state.token = access_token;
            state.isAuthenticated = true;
            state.permissions = permissions;
            localStorage.setItem('token', access_token);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.permissions = [];
            localStorage.removeItem('token');
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchMe.fulfilled, (state, action) => {
            const { user, permissions } = action.payload;
            state.user = user;
            state.permissions = permissions;
        });
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
