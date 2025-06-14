import axios from 'axios';

const DevMode = import.meta.env.MODE === 'development';
const apiHost = import.meta.env.VITE_BACKEND_HOST;

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: `${apiHost}/chat/api`, // Base URL for all API requests
    withCredentials: true, // required for cross-origin cookies
});


// Add an interceptor to include the token in headers
// axiosInstance.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('jwt');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

export default axiosInstance;
