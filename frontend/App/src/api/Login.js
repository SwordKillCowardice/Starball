// src/api/user.js
import api from './index.js';

// 注册接口
export const registerUser = (user_name, password) => {
    return api.post('/auth/register', { user_name, password });
};

// 登录接口
export const loginUser = (user_name, password) => {
    return api.post('/auth/login', { user_name, password });
};

export const getUserInfo = (user_id) => {
    return api.get('/user', { params: { user_id } });
};  