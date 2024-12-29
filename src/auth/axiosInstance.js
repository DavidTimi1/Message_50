import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: '/api', // Base URL for all API requests
});


// Add an interceptor to include the token in headers
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;
