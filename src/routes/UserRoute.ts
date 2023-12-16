import express from "express";
import { protect } from "../middleware/authMiddleware";
const userControllers = require("../controllers/UserController");

const router = express.Router();

router.route("/signup").post(userControllers.registerUser);
router.route("/login").post(userControllers.loginUser);
router.route("/forgetPassword").post(userControllers.forgetPassword);
router.route("/resetPassword").post(userControllers.resetPassword);
router.route("/editProfile").put(protect, userControllers.editProfile);

export default router;
