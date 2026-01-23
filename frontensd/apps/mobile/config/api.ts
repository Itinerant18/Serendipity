// API configuration
const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.135:5000/api',
  WEB_URL: process.env.EXPO_PUBLIC_WEB_URL || 'http://192.168.0.135:4000',
  TIMEOUT: 10000,
};

export default API_CONFIG;