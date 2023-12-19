const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const salt = 12;
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const nodemailer = require("nodemailer");
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
      return res.status(500).json({ message: "internal server error" });
    }
  },

  forgetPassword: async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });

      if (user === null)
        return res.status(403).json({ message: "Invalid credentials" });
      const transporter = nodemailer.createTransport({
        sender: process.env.MAIL_SENDER_EMAIL,
        port: process.env.MAIL_PORT,
        host: process.env.HOST_NAME,

        auth: {
          user: process.env.MAIL_SENDER_EMAIL,
          pass: process.env.MAIL_SENDER_PASSWORD,
        },
      });

      const OTP = generateOTP();
      await transporter.sendMail({
        from: process.env.MAIL_SENDER_EMAIL,
        to: user.email,
        subject: "Password Recovery - Your One-Time Password (OTP)",
        text: `Hi ${user.fullName.split(" ")[1]} ,

        I hope this email finds you well. We've received a request to recover your password. To proceed with the password recovery process, use the following one-time password (OTP):

        ${OTP}

        

        If you did not request a password recovery or have any concerns, please ignore this email.

        Thank you,
        My Online Shopping
        `,
      });

      const updated = await User.findByIdAndUpdate(
        user._id,
        { auth: { OTP: OTP, Date: Date.now() } },
        { new: true }
      );

      return res.status(201).json({ message: "mail sent", updated });
    } catch (error) {
      return res.status(500).json({ message: "internal server error" });
    }
  },

  resetPassword: async (req, res) => {
    const { otps } = req.body;

    try {
      const user = await User.findOne({ "auth.OTP": otps });

      if (!user) return res.status(403).json({ message: "invalid token" });

      if (user.auth?.Date + 1000 * 60 * 5 <= Date.now()) {
        return res.status(403).json({ message: "Token expired..." });
      }
      return res.status(201).json({ message: "verified" });
    } catch (error) {
      return res.status(500).json({ message: "internal server error" });
    }
  },

  updatePassword: async (req, res) => {
    const { password } = req.body;
    try {
      const user = await User.findById(req.user);
      const comparedPassword = await bcrypt.compare(password, user.password);

      if (comparedPassword)
        return res.status(403).json({
          message: "You can not set current password as new password",
        });
      const hashedPassword = await bcrypt.hash(password, salt);

      const updated = await User.findByIdAndUpdate(
        req.user,
        { password: hashedPassword, auth: { OTP: null, Date: null } },
        { new: true }
      );

      return res
        .status(201)
        .json({ message: "password updated successfully", updated });
    } catch (error) {
      return res.status(500).json({ message: "internal server error" });
    }
  },
  changePassword: async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
      const user = await User.findById(req.user);
      const oldMatch = await bcrypt.compare(oldPassword, user.password);

      if (!oldMatch)
        return res.status(403).json({ message: "invalid old Password" });
      const isMatch = await bcrypt.compare(newPassword, user.password);
      if (isMatch)
        return res
          .status(403)
          .json({ message: "You can not set old password as new password" });
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      const changedPassword = await User.findByIdAndUpdate(
        req.user,
        { password: hashedPassword },
        { new: true }
      );
      return res
        .status(201)
        .json({ message: "change password successfully", changedPassword });
    } catch (error) {
      return res.status(500).json({ message: "internal server error" });
    }
  },
  requestTokenForVerify: async (req, res) => {
    try {
      const user = await User.findById(req.user);

      if (!user) return res.status(403).json({ message: "No user found" });

      const transporter = nodemailer.createTransport({
        sender: process.env.MAIL_SENDER_EMAIL,
        port: process.env.MAIL_PORT,
        host: process.env.HOST_NAME,

        auth: {
          user: process.env.MAIL_SENDER_EMAIL,
          pass: process.env.MAIL_SENDER_PASSWORD,
        },
      });

      const OTP = generateOTP();
      await transporter.sendMail({
        from: process.env.MAIL_SENDER_EMAIL,
        to: user.email,
        subject: "Profile Verification - Your One-Time Password (OTP)",
        text: `Hi ${user.fullName.split(" ")[1]} ,

        I hope this email finds you well. We've received a request to verify your profile. To proceed with the profile verification process, use the following one-time password (OTP):

        ${OTP}

        

        If you did not request a verify profile or have any concerns, please ignore this email.

        Thank you,
        My Online Shopping
        `,
      });

      const updated = await User.findByIdAndUpdate(
        req.user,
        { auth: { OTP: OTP, Date: Date.now() } },
        { new: true }
      );

      return res.status(201).json({ message: "mail sent", updated });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  verifyProfile: async (req, res) => {
    const { otp } = req.body;

    try {
      const user = await User.findOne({ "auth.OTP": otp });
      if (!user)
        return res
          .status(403)
          .json({ message: "No user found please check it " });

      if (
        user.auth?.Date !== null &&
        user.auth?.Date + 1000 * 60 * 5 <= Date.now()
      ) {
        return res.status(403).json({ message: "Token expired..." });
      }
      const updated = await User.findByIdAndUpdate(
        user._id,
        { auth: { OTP: null, Date: null }, verified: true },
        { new: true }
      );

      return res.status(201).json({ message: "verified", updated });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = userCtrl;

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET);
};

const generateOTP = () => {
  let OTP = "";
  const nums = "1234567890";
  for (let i = 0; i < 4; i++) {
    const element = nums[Math.floor(Math.random() * 10)];
    OTP += element;
  }
  return OTP;
};
