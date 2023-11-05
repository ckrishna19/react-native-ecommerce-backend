const userCtrl = require("../controller/userController");

const router = require("express").Router();

router.post("/new", userCtrl.register);

router.post("/login", userCtrl.login);

module.exports = router;
