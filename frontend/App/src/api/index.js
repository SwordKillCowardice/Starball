import axios from "axios";

// 创建 axios 实例
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // ✅ 你的后端地址
    timeout: 5000, // 请求超时时间
});

console.log('API base URL:', import.meta.env.VITE_API_BASE_URL);

// 请求拦截器
api.interceptors.request.use(
    (config) => {
        // 这里可以统一添加 token
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// 响应拦截器
api.interceptors.response.use(
    (response) => response, // 直接返回后端 data 部分
    (error) => {
        console.error("API Error:", error);
        return Promise.reject(error);
    }
);

export default api;
