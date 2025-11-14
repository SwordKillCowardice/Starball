import api from './index.js';

// 获取球杆信息接口
export const getCueInfo = (user_id) => {
    return api.get('/bar/list', { params: { user_id } });
};

export const CreateRoom = (user_id) => {
    return api.post('/room/create', { user_id });
}

export const JoinRoom = (user_id, room_id) => {
    return api.post('/room/join', { user_id, room_id });
}