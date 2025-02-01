import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { format } from "date-fns";

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/Attendance")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Mongoose Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const subjectSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  name: String,
  day: String,
  time: String,
});

const attendanceSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  subjectId: mongoose.Schema.Types.ObjectId,
  date: String,
  status: Boolean,
});

const User = mongoose.model("User", userSchema);
const Subject = mongoose.model("Subject", subjectSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);

// Middleware for Auth
const authenticateToken = async (req, res, next) => {
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "arotra21205"
      );
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ error: "Not authorized, invalid token" });
    }
  } else {
    res.status(401).json({ error: "No token provided" });
  }
};

// User Registration
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "arotra21205",
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Routine (Auth required)
app.post("/api/routine", authenticateToken, async (req, res) => {
  try {
    const { routine } = req.body;

    const processedRoutine = routine.map((subject) => {
      const timeMatch = subject.name.match(/(\d{1,2}:\d{2}\s*[AaPp][Mm])/);
      const time = timeMatch ? timeMatch[1] : "9:00 AM";
      const name = subject.name
        .replace(/\d{1,2}:\d{2}\s*[AaPp][Mm]/, "")
        .trim();

      return { userId: req.user.id, name, day: subject.day, time };
    });

    const savedSubjects = await Subject.insertMany(processedRoutine);
    res.json(savedSubjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Today's Subjects (Auth required)
app.get("/api/today-subjects", authenticateToken, async (req, res) => {
  try {
    console.log("Date = ",format(new Date(),"dd/MM/yyyy"));
    
    const today = format(new Date(), "EEEE");

    const subjects = await Subject.find({ userId: req.user.id, day: today });
    // res.json(subjects);

    const attendanceRecords = await Attendance.find({
      userId: req.user.id,
      date: format(new Date(),"dd/MM/yyyy"),
    });
    //   res.json(attendanceRecords);

    const subjectsWithAttendance = subjects.map((subject) => {
      const attendance = attendanceRecords.find(
        (a) => a.subjectId.toString() === subject._id.toString()
      );
      //  res.json(attendance);
      return {
        ...subject.toObject(),
        attendance: attendance ? attendance.status : null,
      };
    });

        res.json(subjectsWithAttendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark Attendance (Auth required)
app.post("/api/attendance", authenticateToken, async (req, res) => {
  try {
    const { subjectId, status, date } = req.body;

    const attendance = await Attendance.findOneAndUpdate(
      { userId: req.user.id, subjectId, date },
      { status },
      { upsert: true, new: true }
    );

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//get attendance of each subject
app.get("/api/attendance", authenticateToken, async (req, res) => {
  try {
    // Fetch the subjects of the user
    const subjects = await Subject.find({ userId: req.user.id });

    // For each subject, calculate attendance
    const attendanceData = await Promise.all(
      subjects.map(async (subject) => {
        // Get attendance records for the subject
        const attendanceRecords = await Attendance.find({
          userId: req.user.id,
          subjectId: subject._id,
        });

        // Calculate total classes and attended classes
        const totalClasses = attendanceRecords.length;
        const attendedClasses = attendanceRecords.filter(
          (record) => record.status === true
        ).length;

        // Calculate attendance percentage
        const attendancePercentage = totalClasses
          ? (attendedClasses / totalClasses) * 100
          : 0;

        return {
          subjectName: subject.name,
          totalClasses,
          attendedClasses,
          attendancePercentage: attendancePercentage.toFixed(2),
        };
      })
    );

    res.json(attendanceData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
