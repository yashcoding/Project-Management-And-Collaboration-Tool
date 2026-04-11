import User from '../models/User.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util.js'
import AppError from '../utils/AppError.js'

const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered.', 409);
  const user = await User.create({ name, email, password });
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshTokens.push({ token: refreshToken });
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }
  if (!user.isActive) throw new AppError('Account deactivated.', 403);

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Keep max 5 refresh tokens per user
  if (user.refreshTokens.length >= 5) user.refreshTokens.shift();
  user.refreshTokens.push({ token: refreshToken });
  await user.save({ validateBeforeSave: false });

  return { user, accessToken, refreshToken };
};

const refresh = async (token) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new AppError('Invalid or expired refresh token.', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('User not found.', 401);

  const tokenExists = user.refreshTokens.some(t => t.token === token);
  if (!tokenExists) throw new AppError('Refresh token revoked.', 401);

  const accessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  // Rotate refresh token
  user.refreshTokens = user.refreshTokens.filter(t => t.token !== token);
  user.refreshTokens.push({ token: newRefreshToken });
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken: newRefreshToken };
};

const logout = async (userId, token) => {
  const user = await User.findById(userId);
  if (user) {
    user.refreshTokens = user.refreshTokens.filter(t => t.token !== token);
    await user.save({ validateBeforeSave: false });
  }
};

export {
  register as registerUser,
  login as loginUser,
  refresh as userRefreshToken,
  logout as logoutUser
};