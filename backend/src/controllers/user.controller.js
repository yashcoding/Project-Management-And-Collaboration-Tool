import {
  getUserProfile,
  updateUserProfile,
  searchUsersService,
} from '../services/user.service.js';

import { successResponse } from '../utils/apiResponse.util.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await getUserProfile(req.user._id);
    successResponse(res, 200, 'Profile fetched.', { user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await updateUserProfile(req.user._id, req.body);
    successResponse(res, 200, 'Profile updated.', { user });
  } catch (err) {
    next(err);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const users = await searchUsersService(req.query.q);
    successResponse(res, 200, 'Users fetched.', { users });
  } catch (err) {
    next(err);
  }
};