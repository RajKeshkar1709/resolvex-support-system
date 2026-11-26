import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Sends and accepts HttpOnly cookies
});

// Automatic silent token refresh on 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If request failed with 401 and hasn't been retried yet (avoid infinite loop on /auth routes)
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        // Exchange 7-day refresh cookie for a fresh 15-min access token
        await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        // Retry the original user request with fresh token cookie
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        // Refresh token itself expired or invalid
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
