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

// Enhanced clearAuthData function to remove all authentication-related localStorage items
export const clearAuthData = () => {
  // Clear existing items
  localStorage.removeItem('userData');
  localStorage.removeItem('authToken');
  localStorage.removeItem('selectedRole');
  
  // Clear additional items you mentioned
  localStorage.removeItem('deviceType');
  localStorage.removeItem('mobile');
  localStorage.removeItem('doctorData');
  localStorage.removeItem('isProfileComplete');
  
  // Clear all cookies
  document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'remember_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'access_token_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Optional: Clear all localStorage items that might be app-related
  // You can be more specific about which items to keep if needed
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      keysToRemove.push(key);
    }
  }
  
  // Remove all keys (be careful with this approach if you have other non-auth data)
  // keysToRemove.forEach(key => localStorage.removeItem(key));
};

// Alternative: More selective clearing function
export const clearAllAppData = () => {
  const appKeys = [
    'userData',
    'authToken', 
    'selectedRole',
    'deviceType',
    'mobile',
    'doctorData', 
    'isProfileComplete'
  ];
  
  appKeys.forEach(key => localStorage.removeItem(key));
  
  // Clear cookies
  document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'remember_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'access_token_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

// Logout function that can be called from anywhere in your app
export const logout = () => {
  // Clear all authentication data
  clearAllAppData();
  
  // Redirect to login page
  window.location.href = '/login';
};

export default axiosInstance;