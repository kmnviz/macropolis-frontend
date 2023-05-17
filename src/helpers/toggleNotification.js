import {addNotification, removeNotification} from '../store/slices/notificationSlice';

const ToggleNotification = (dispatch, message, status) => {
    const id = Math.random().toString();
    dispatch(addNotification({message: message, id: id, status: status}));
    setTimeout(() => {
        dispatch(removeNotification({id: id}));
    }, 3000);
};

export default ToggleNotification;
