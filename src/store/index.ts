import { configureStore } from '@reduxjs/toolkit';
import AppSessionslice from './slice/sessionslice';
import documentSlice from './slice/documentslice';
import templateSlice from './slice/templateslice';
import meetSessionReducer from './slice/meetSessionslice';

export const store = configureStore({
    reducer: {
        AppSessions: AppSessionslice,
        documents: documentSlice,
        templates: templateSlice,
        meetSession: meetSessionReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;