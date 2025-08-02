import { configureStore } from '@reduxjs/toolkit';
import AppSessionslice from './slice/sessionslice';
import documentSlice from './slice/documentslice';

export const store = configureStore({
    reducer: {
        AppSessions: AppSessionslice,
        documents: documentSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;