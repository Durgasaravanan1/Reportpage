import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    // Stored as YYYY-MM-DD (local date) so one report == one day
    date: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    project: { type: String, default: '', trim: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Report', reportSchema);
