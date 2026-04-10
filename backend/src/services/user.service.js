import User from '../models/User.js';
import AppError from '../utils/AppError.js';

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const updateUserProfile = async (userId, body) => {
  const allowed = ['name', 'avatar'];
  const updates = {};

  allowed.forEach((field) => {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  });

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new AppError('User not found', 404);

  return user;
};

export const searchUsersService = async (query) => {
  if (!query || query.length < 2) return [];

  const users = await User.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
    ],
    isActive: true,
  })
    .select('name email avatar')
    .limit(10);

  return users;
};