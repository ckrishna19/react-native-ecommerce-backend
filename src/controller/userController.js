const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const salt = 12;
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const userCtrl = {
  register: async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email }).select("-password");
      if (user)
        return res.status(401).json({ message: "You already registered here" });
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = await User.create({
        ...req.body,
        password: hashedPassword,
      });
      const accessToken = generateToken({ id: newUser._id });
      return res.status(201).json({
        message: "Registered..",
        user: {
          ...newUser._doc,
          password: "",
        },
        accessToken,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(403).json({ message: "You did not register yet" });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(403).json({ message: "Invalid crediantial" });
      const accessToken = generateToken({ id: user._id });
      return res.status(201).json({
        message: "Login",
        loggedIn: { ...user._doc, password: "" },
        accessToken,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },

  uploadProfileImage: async (req, res) => {
    try {
      const { image } = req.files;

      const user = await User.findById(req.user);

      if (user.image?.publicId !== undefined) {
        await cloudinary.uploader.destroy(user.image?.publicId);
      }

      const result = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: "rn-ecommerce-profile",
      });

      const updateProfileImage = await User.findByIdAndUpdate(
        req.user,
        {
          "image.url": result.url,
          "image.publicId": result.public_id,
        },
        { new: true }
      );

      fs.unlink(image.tempFilePath, (err) => {
        if (err) throw err;
      });

      return res
        .status(201)
        .json({ message: "updated successfully", updateProfileImage });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "internal server error" });
    }
  },
};

module.exports = userCtrl;

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET);
};
