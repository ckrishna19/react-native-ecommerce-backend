const User = require("../model/userModel");

const otpAuth = async (req, res, next) => {
  const otp = req.headers["otp"];
  if (!otp)
    return res.status(403).json({ message: "No token found please login" });
  try {
    const user = await User.findOne({ "auth.OTP": otp });

    if (!user) return res.status(403).json({ message: "invalid token" });
    req.user = user._id.toString();
    next();
  } catch (error) {
    return res.status(500).json({ message: "internal server error" });
  }
};
module.exports = otpAuth;
