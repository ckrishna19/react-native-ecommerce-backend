const userCtrl = require("../controller/userController");
const auth = require("../utils/auth");
const otpAuth = require("../utils/otpAuth");
const router = require("express").Router();

router.post("/new", userCtrl.register);

router.post("/login", userCtrl.login);
router.post("/uploadImage", auth, userCtrl.uploadProfileImage);
router.post("/forget-password", userCtrl.forgetPassword);
router.post("/reset-password", userCtrl.resetPassword);
router.post("/update-password", otpAuth, userCtrl.updatePassword);
router.post("/change-password", auth, userCtrl.changePassword);
router.get("/request-for-verify", auth, userCtrl.requestTokenForVerify);
router.post("/verify-profile", userCtrl.verifyProfile);

module.exports = router;
