
import { registerUser, loginUser, userRefreshToken, logoutUser } from "../services/auth.service.js";
import { successResponse } from "../utils/apiResponse.util.js";
const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await registerUser(req.body);
    successResponse(res, 201, 'Registration successful.', { user, accessToken, refreshToken });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await loginUser(req.body);
    successResponse(res, 200, 'Login successful.', { user, accessToken, refreshToken });
  } catch (err) { next(err); }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await userRefreshToken(refreshToken);
    successResponse(res, 200, 'Token refreshed.', tokens);
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await logoutUser(req.user._id, refreshToken);
    successResponse(res, 200, 'Logged out successfully.');
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    successResponse(res, 200, 'User fetched.', { user: req.user });
  } catch (err) { next(err); }
};

export { register, login, refresh, logout, getMe };