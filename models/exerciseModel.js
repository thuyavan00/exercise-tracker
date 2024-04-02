const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date },
  },
  {
    timestamps: false,
  }
);

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;
