import mongoose from "mongoose";
const taskPriorities = ["low", "medium", "high"];
const TaskSchema = new mongoose.Schema(
  {
    time_line: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: taskPriorities,
      default: "low",
    },
    description: {
      type: String,
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.String,
      ref: "Users",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tasks", TaskSchema);
