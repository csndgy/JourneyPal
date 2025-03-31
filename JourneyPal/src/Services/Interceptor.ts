/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:7193',
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        console.error('Interceptor error:', error.response?.data)
        const originalRequest = error.config;

        // Only handle 401 errors and avoid infinite retry loops
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const token = localStorage.getItem('token');

                // If no refresh token exists, log out completely
                if (!refreshToken) {
                    handleFullLogout();
                    return Promise.reject(error);
                }

                // Check if token is expired (optional but recommended)
                if (token) {
                    const decodedToken = decodeToken(token);
                    if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
                        // Token isn't actually expired, might be server-side invalidation
                        handleFullLogout();
                        return Promise.reject(error);
                    }
                }

                // Attempt to refresh tokens
                const response = await axios.post(
                    'https://localhost:7193/api/Auth/refresh',
                    { refreshToken }
                );

                // Store new tokens
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('refreshToken', response.data.refreshToken);

                // Update the original request header
                originalRequest.headers.Authorization = `Bearer ${response.data.token}`;

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, log out completely
                handleFullLogout();
                return Promise.reject(refreshError);
            }
        }

        // For other errors, just reject
        return Promise.reject(error);
    }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decodeToken(token: string): any {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch (e) {
        return null;
    }
}

export function handleFullLogout() {
    localStorage.clear();
    window.location.href = '/login';
}

export default api;