const orderCtrl = require("../controller/orderController");

const router = require("express").Router();

router.post("/payment", orderCtrl.payment);

router.post("/new", orderCtrl.createOrder);

router.get("/all", orderCtrl.getAllOrder);

module.exports = router;
