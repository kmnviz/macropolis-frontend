import { createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';

const initialState = {
    notifications: [],
};

export const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action) => {
            state.notifications = [...state.notifications, action.payload];
        },
        removeNotification: (state, action) => {
            state.notifications = [
                ...state.notifications.filter((notification) => notification.id !== action.payload.id)
            ];
        },
        extraReducers: {
            [HYDRATE]: (state, action) => {
                return {
                    ...state,
                    ...action.payload.notifications,
                };
            },
        },
    },
});

export const { addNotification, removeNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
