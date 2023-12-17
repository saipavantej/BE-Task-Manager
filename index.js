import express from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./src/routes/UserRoute";
import tasksRoutes from "./src/routes/TaskRoute";
const app = express();

app.use(cors());

app.use(morgan("tiny"));

dotenv.config();

const connectDB = require("./src/config/config");
connectDB();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/task", tasksRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
