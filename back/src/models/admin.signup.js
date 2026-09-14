const mongoose = require('mongoose');

const adminSignupSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const AdminSignup = mongoose.model('AdminSignup', adminSignupSchema);

module.exports = AdminSignup;