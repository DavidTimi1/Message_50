import axios from 'axios';
const apiHost = import.meta.env.VITE_BACKEND_HOST;
const apiVersion = import.meta.env.VITE_BACKEND_VERSION || 'v2';

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: `${apiHost}/api/${apiVersion}`, // Base URL for all API requests
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
