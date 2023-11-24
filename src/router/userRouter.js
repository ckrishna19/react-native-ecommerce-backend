const userCtrl = require("../controller/userController");
const auth = require("../utils/auth");
const router = require("express").Router();

router.post("/new", userCtrl.register);

router.post("/login", userCtrl.login);
router.post("/uploadImage", auth, userCtrl.uploadProfileImage);

module.exports = router;
