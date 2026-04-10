import mongoose from "mongoose"

const columnSchema = new mongoose.Schema({
  name: { type: String, required: true },
  order: { type: Number, default: 0 },
  color: { type: String, default: '#e2e8f0' },
}, { _id: true });

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Board name is required'],
    trim: true,
    maxlength: [100, 'Board name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  columns: {
    type: [columnSchema],
    default: [
      { name: 'Todo', order: 0, color: '#e2e8f0' },
      { name: 'In Progress', order: 1, color: '#fef3c7' },
      { name: 'Done', order: 2, color: '#d1fae5' },
    ],
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

boardSchema.index({ project: 1, createdAt: -1 });

export default mongoose.model('Board', boardSchema);