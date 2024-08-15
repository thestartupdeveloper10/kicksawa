import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

const getToken = () => {
  const persistRoot = localStorage.getItem("persist:root");
  if (persistRoot) {
    const { user } = JSON.parse(persistRoot);
    if (user) {
      const { currentUser } = JSON.parse(user);
      if (currentUser && currentUser.token) {
        return currentUser.token;
      }
    }
  }
  return null;
};

export const publicRequest = axios.create({
  baseURL: BASE_URL,
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
});

// Add an interceptor to dynamically set the token for each request
userRequest.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.token = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);