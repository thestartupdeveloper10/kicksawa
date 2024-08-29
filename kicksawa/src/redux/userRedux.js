import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  userId: null,
  isFetching: false,
  error: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isFetching = true;
      state.error = false;
    },
    loginSuccess: (state, action) => {
      state.isFetching = false;
      state.currentUser = action.payload;
      state.userId = action.payload.id;
    },
    loginFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
    resetError: (state) => {
      state.error = false;
    },
    logout: (state) => {
      state.currentUser = null;
      state.userId = null;
    },
    registerStart: (state) => {
      state.isFetching = true;
    },
    registerSuccess: (state, action) => {
      state.isFetching = false;
      state.currentUser = action.payload;
      state.userId = action.payload.id;
    },
    registerFailure: (state) => {
      state.isFetching = false;
      state.error = true;
    },
    updateUser: (state, action) => {
      state.currentUser = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
  resetError,
  updateUser,
} = userSlice.actions;

export const selectCurrentUser = (state) => state.user.currentUser;
export const selectUserId = (state) => state.user.userId;

export default userSlice.reducer;