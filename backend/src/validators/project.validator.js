import Joi from "joi";

const createProjectSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().max(500).allow('').optional(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
});

const updateProjectSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  description: Joi.string().trim().max(500).allow('').optional(),
  color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  isArchived: Joi.boolean().optional(),
});

const inviteMemberSchema = Joi.object({
  email: Joi.string().email().lowercase().required(),
  role: Joi.string().valid('admin', 'member').default('member'),
});

export { createProjectSchema, updateProjectSchema, inviteMemberSchema };