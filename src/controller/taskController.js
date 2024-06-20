const { get } = require("express/lib/response");
const taskModel = require("../model/taskModel");

const taskCtrl = {
  createTask: async (req, res) => {
    try {
      const { title, description } = req.body;
      if (!title || !description)
        return res.status(403).json({ message: "All fields are compolsory" });

      const newTask = await taskModel.create(req.body);
      return res.status(201).json({ message: "successfully created", newTask });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getAllTask: async (req, res) => {
    try {
      const allTask = await taskModel.find({});

      if (allTask.length < 1)
        return res
          .status(401)
          .json({ message: "Empitied task please create.." });
      return res.status(202).json({ message: "successfully fetched", allTask });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },
  getSingleTask: async (req, res) => {
    try {
      const singleTask = await taskModel.findById(req.params.id);
      if (!singleTask)
        return res.status(403).json({ message: "No task found" });
      return res
        .status(201)
        .json({ message: "found successfully", singleTask });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  updateTask: async (req, res) => {
    try {
      const updatedTask = await taskModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      return res
        .status(201)
        .json({ message: "Successfully updated", updatedTask });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteTask: async (req, res) => {
    try {
      await taskModel.findByIdAndDelete(req.params.id);
      return res.status(201).json({ message: "delete successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};

module.exports = taskCtrl;
