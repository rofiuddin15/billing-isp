import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
// import other reducers as they are created

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
});
