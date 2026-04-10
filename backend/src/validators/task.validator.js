import Joi from "joi";

const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().max(5000).allow('').optional(),
  status: Joi.string().valid('todo', 'in_progress', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  dueDate: Joi.date().iso().allow(null).optional(),
  assignee: Joi.string().hex().length(24).allow(null).optional(),
  columnId: Joi.string().hex().length(24).allow(null).optional(),
  labels: Joi.array().items(Joi.string().trim()).optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  description: Joi.string().trim().max(5000).allow('').optional(),
  status: Joi.string().valid('todo', 'in_progress', 'done').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  dueDate: Joi.date().iso().allow(null).optional(),
  assignee: Joi.string().hex().length(24).allow(null).optional(),
  columnId: Joi.string().hex().length(24).allow(null).optional(),
  labels: Joi.array().items(Joi.string().trim()).optional(),
  order: Joi.number().optional(),
});

export { createTaskSchema, updateTaskSchema };