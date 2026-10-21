import axios from "axios";
import { store } from "../redux/Store";
import { logout } from "../redux/userRedux";

const BASE_URL = "/api/";
// http://localhost:5000
// Function to get the current user's token
const getCurrentUserToken = () => {
  const persistRoot = localStorage.getItem("persist:root");
  if (persistRoot) {
    const { user } = JSON.parse(persistRoot);
    if (user) {
      const { currentUser } = JSON.parse(user);
      return currentUser?.token;
    }
  }
  return null;
};

// Get the token
const TOKEN = getCurrentUserToken();



export const publicRequest = axios.create({
  baseURL: BASE_URL,
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${TOKEN}` },
});

// Interceptor to update the token if it changes
userRequest.interceptors.request.use((config) => {
  const token = getCurrentUserToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// The token lasts an hour and there is no refresh endpoint, so a 401 here means
// the session is over. Clearing it lets ProtectedRoute bounce the user to the
// login page instead of leaving the UI pretending they are still signed in.
// Login itself goes through publicRequest, so a wrong password never lands here.
userRequest.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    store.dispatch(logout());
  }
  return Promise.reject(error);
});