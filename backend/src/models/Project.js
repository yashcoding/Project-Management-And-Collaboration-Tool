import mongoose from "mongoose"

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [memberSchema],
  color: {
    type: String,
    default: '#6366f1',
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Virtual for board count
projectSchema.virtual('boardCount', {
  ref: 'Board',
  localField: '_id',
  foreignField: 'project',
  count: true,
});

// Index for performance
projectSchema.index({ owner: 1, createdAt: -1 });
projectSchema.index({ 'members.user': 1 });

const Project = mongoose.model('Project', projectSchema)

export default Project;