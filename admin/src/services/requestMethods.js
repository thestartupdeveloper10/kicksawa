import axios from "axios";
import { store } from "../redux/store";
import { logout } from "../redux/userRedux";

// In development the Vite proxy forwards /api to the backend on port 5000
// (see vite.config.js), so requests stay same-origin and need no CORS.
// VITE_API_URL points a built admin at a hosted API instead.
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const getToken = () => store.getState().user.currentUser?.token ?? null;

export const publicRequest = axios.create({
  baseURL: BASE_URL,
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
});

// Read the token at request time, so a fresh login applies immediately.
userRequest.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A rejected token (expired, or no longer an admin) ends the session, which
// sends the panel back to the login page.
userRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // 403 is also "admins can't do this" (e.g. deleting an admin account);
      // only a token the API rejects outright should end the session.
      const message = error.response.data;
      if (error.response.status === 401 || message === "Token is not valid!" || message === "You are not allowed to do that!") {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);

/** The API's own error message, or a fallback. */
export const apiError = (error, fallback = "Something went wrong. Please try again.") =>
  error?.response?.data?.error || fallback;
