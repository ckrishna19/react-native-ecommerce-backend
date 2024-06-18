const router = require("express").Router();

const taskCtrl = require("../controller/taskController");

router.post("/new", taskCtrl.createTask);

router.get("/", taskCtrl.getAllTask);

router.get("/:id", taskCtrl.getSingleTask);

router.patch("/:id", taskCtrl.updateTask);

router.delete("/:id", taskCtrl.deleteTask);

module.exports = router;
