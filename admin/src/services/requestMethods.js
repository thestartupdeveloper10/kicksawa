import axios from "axios";
import { store } from "../redux/store";
import { logout } from "../redux/userRedux";

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
      // The API only reads the standard Authorization header; the old custom
      // `token` header was ignored, so every admin request was rejected.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// A rejected token (expired, or no longer an admin) ends the session, which
// sends the panel back to the login page.
userRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);
