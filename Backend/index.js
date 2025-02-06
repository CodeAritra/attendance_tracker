import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db/db.js";
import authRoutes from "./routes/authRoutes.js";
import routineRoutes from "./routes/routineRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

dotenv.config();

const app = express();

// MongoDB Connection
connectDB();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/routine", routineRoutes);
app.use("/api/attendance", attendanceRoutes);

app.get("/", (req, res) => {
  res.send("WELCOME TO THE SERVER");
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
