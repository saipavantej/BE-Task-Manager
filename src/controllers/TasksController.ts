const Task = require("../modals/TasksModal");
const jwt = require("jsonwebtoken");

import { Request, Response } from "express";

const createTask = async (req: Request, res: Response) => {
  try {
    const id = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(id, process.env.JWT_SECRET);
    let task = new Task({
      user: decoded.id,
      time_line: req.body.time_line,
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
    });

    task = await task.save();
    task = await task.populate("user", { user_name: 1, _id: 1 });

    if (!task)
      return res
        .status(200)
        .send({ error: true, message: "the role cannot be created!" });
    res.status(200).send({
      error: false,
      response: task,
    });
  } catch (error) {
    res.status(200).send({ error: true, message: error });
  }
};

const getTasks = async (req: Request, res: Response) => {
  try {
    const { page, per_page } = req.query;

    const pageValue = page ? String(page) : "1";
    const perPageValue = per_page ? String(per_page) : "10";

    const id = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(id, process.env.JWT_SECRET);

    const totalCount = await Task.countDocuments({ user: decoded.id });
    const totalPages = Math.ceil(totalCount / parseInt(perPageValue, 10));

    const tasks = await Task.find({ user: decoded.id })
      .skip((parseInt(pageValue, 10) - 1) * parseInt(perPageValue, 10))
      .limit(parseInt(perPageValue, 10))
      .populate("user", { user_name: 1, _id: 1 });

    res.status(200).send({
      error: false,
      response: tasks,
      page_no: parseInt(pageValue, 10),
      total_count: totalCount,
      total_pages: totalPages,
    });
  } catch (error) {
    res.status(200).send({ error: true, message: error });
  }
};

const editTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const id = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(id, process.env.JWT_SECRET);
    const task = await Task.findOne({ _id: taskId, user: decoded.id });

    if (!task) {
      return res.status(200).send({
        error: true,
        message: "Task not found or not owned by the user",
      });
    }
    const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {
      new: true,
      runValidators: true,
    }).populate("user", { user_name: 1, _id: 1 });

    res.status(200).send({ error: false, response: updatedTask });
  } catch (error) {
    res.status(200).send({ error: true, message: error });
  }
};

const deleteTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const id = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(id, process.env.JWT_SECRET);

    // Check if the task is associated with the authenticated user
    const task = await Task.findOne({ _id: taskId, user: decoded.id });

    if (!task) {
      return res.status(200).send({
        error: true,
        message: "Task not found or not owned by the user",
      });
    }

    // Perform the delete operation only if the task is associated with the user
    await Task.findByIdAndRemove(taskId);

    res
      .status(200)
      .send({ error: false, message: "Task deleted successfully" });
  } catch (error) {
    res.status(200).send({ error: true, message: error });
  }
};

module.exports = { createTask, editTask, getTasks, deleteTask };
