import { loginFailure, loginStart, loginSuccess } from "./userRedux";
import { publicRequest } from "../services/requestMethods";

/** Resolves true when an admin signed in. Customer accounts are turned away. */
export const login = async (dispatch, user) => {
  dispatch(loginStart());
  try {
    const res = await publicRequest.post("/auth/login", user);
    if (!res.data.isAdmin) {
      dispatch(loginFailure("This account does not have admin access."));
      return false;
    }
    dispatch(loginSuccess(res.data));
    return true;
  } catch (err) {
    dispatch(loginFailure(err.response?.status === 429 ? err.response.data?.error : undefined));
    return false;
  }
};
