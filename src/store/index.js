import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { notificationsSlice } from './slices/notificationSlice';

const makeStore = () =>
    configureStore({
        reducer: {
            [notificationsSlice.name]: notificationsSlice.reducer,
        },
        devTools: true,
    });

export const wrapper = createWrapper(makeStore);
