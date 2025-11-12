import api from './index.js';

export const HandleBuy = (user_id, bar_id) => {
    return api.post('/auth/buy', { user_id, bar_id });
};