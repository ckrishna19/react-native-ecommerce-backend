const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String },
    verified: { type: Boolean, default: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    phone: { type: String },
    auth: { OTP: Number, Date: Number },

    address: {
      district: { type: String },
      municipility: { type: String },
      ward: { type: String },
    },
  },

  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
