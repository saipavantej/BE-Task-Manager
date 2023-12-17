import express from "express";
import { protect } from "../middleware/authMiddleware";
const taskControllers = require("../controllers/TasksController");

const router = express.Router();
router.route("/createTask").post(protect, taskControllers.createTask);
router.route("/getTasks").get(protect, taskControllers.getTasks);
router.route("/editTask/:id").patch(protect, taskControllers.editTask);
router.route("/deleteTask/:id").delete(protect, taskControllers.deleteTask);

export default router;
