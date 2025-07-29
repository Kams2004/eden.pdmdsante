import axios from 'axios';

const BASE_URL = 'https://site.pdmdsante.com/';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add a request interceptor to include the token in the headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Define the type for the cookies object
interface Cookies {
  [key: string]: string;
}

// Optional: Manually set cookies if needed (not recommended for sensitive data)
const setCookiesInHeaders = () => {
  const cookies: Cookies = document.cookie.split(';').reduce((acc: Cookies, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  // Set cookies in default headers
  if (cookies['access_token_cookie']) {
    axiosInstance.defaults.headers.common['Cookie'] = `access_token_cookie=${cookies['access_token_cookie']}`;
  }
};

// Call this function before making requests if manually setting cookies
setCookiesInHeaders();

// Add a response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.data && error.response.data.msg === 'Token has expired') {
      // Clear authentication data
      clearAuthData();

      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const clearAuthData = () => {
  localStorage.removeItem('userData');
  localStorage.removeItem('authToken');
  document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'remember_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'access_token_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

export default axiosInstance;
