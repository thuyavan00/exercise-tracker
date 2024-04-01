const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
  },
  {
    timestamps: false,
  }
);
const User = mongoose.model('User', userSchema);

module.exports = User;
