const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: String },
  },
  {
    timestamps: false,
  }
);

exerciseSchema.pre('save', function (next) {
  // Set default value for createdAt field only if it's not provided
  if (!this.date) {
    this.date = new Date().toDateString(); // Convert to string using toDateString()
  }
  next();
});
const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;
