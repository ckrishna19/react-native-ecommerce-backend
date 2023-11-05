const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: {
      url: { type: String },
      publicId: { type: String },
    },
    phone: { type: String },

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
