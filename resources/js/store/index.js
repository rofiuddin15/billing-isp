import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import customerReducer from './slices/customerSlice';
import packageReducer from './slices/packageSlice';
import voucherReducer from './slices/voucherSlice';
import financeReducer from './slices/financeSlice';
import userReducer from './slices/userSlice';
import voucherPackageReducer from './slices/voucherPackageSlice';
import transactionCategoryReducer from './slices/transactionCategorySlice';
import accountReducer from './slices/accountSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        customers: customerReducer,
        packages: packageReducer,
        voucherPackages: voucherPackageReducer,
        vouchers: voucherReducer,
        finance: financeReducer,
        users: userReducer,
        transactionCategories: transactionCategoryReducer,
        accounts: accountReducer,
    },
});
