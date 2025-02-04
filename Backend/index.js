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

const routineSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  day: {
    type: String,
    required: true,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  subjects: [
    {
      name: { type: String, required: true },
      time: { type: String, required: true },
    },
  ],
});

const attendanceSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  subjectId: mongoose.Schema.Types.ObjectId,
  subjectname: String,
  date: String,
  status: Boolean,
});

const User = mongoose.model("User", userSchema);
const Routine = mongoose.model("Routine", routineSchema);
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
// app.post("/api/routine", authenticateToken, async (req, res) => {
//   try {
//     const { routine } = req.body; // Expecting an array of subjects with 'day'

//     const groupedRoutine = {};

//     // Group subjects by day
//     routine.forEach((subject) => {
//       const { day, name, time } = subject;

//       if (!groupedRoutine[day]) {
//         groupedRoutine[day] = { userId: req.user.id, day, subjects: [] };
//       }

//       groupedRoutine[day].subjects.push({ name, time });
//     });

//     // Convert groupedRoutine object to an array
//     const processedRoutine = Object.values(groupedRoutine);

//     // Upsert (Update if exists, Insert if not)
//     for (const entry of processedRoutine) {
//       await Routine.findOneAndUpdate(
//         { userId: entry.userId, day: entry.day }, // Match userId & day
//         { $set: { subjects: entry.subjects } }, // Replace subjects
//         { upsert: true, new: true } // Insert if not exists
//       );
//     }

//     res.json({ message: "Routine saved successfully!" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
app.post("/api/routine", authenticateToken, async (req, res) => {
  try {
    const { day, subjects } = req.body;

    // Ensure user is authenticated
    const userId = req.user.id;
    if (!day || !subjects) {
      return res.status(400).json({ error: "Day and subjects are required." });
    }

    // Find existing routine for the user and day
    const existingRoutine = await Routine.findOne({ userId, day });

    if (existingRoutine) {
      // Merge existing subjects with new subjects
      const updatedSubjects = [...existingRoutine.subjects, ...subjects];

      // Remove duplicate subjects (based on name and time)
      const uniqueSubjects = updatedSubjects.filter(
        (subject, index, self) =>
          index === self.findIndex((s) => s.name === subject.name && s.time === subject.time)
      );

      // Update routine with merged subjects
      existingRoutine.subjects = uniqueSubjects;
      await existingRoutine.save();
      return res.status(200).json({ message: "Routine updated successfully!", routine: existingRoutine });
    }

    // Create a new routine if not found
    const newRoutine = new Routine({ userId, day, subjects });
    await newRoutine.save();
    return res.status(201).json({ message: "Routine added successfully!", routine: newRoutine });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//get routine
app.get("/api/routine", authenticateToken, async (req, res) => {
  try {
    const routine = await Routine.find({ userId: req.user.id });

    // if (!routine || routine.length === 0) {
    //   return res.status(404).json({ message: "No routine found" });
    // }

    res.json(routine);
  } catch (error) {
    console.error("Error fetching routine:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get Today's Subjects (Auth required)
app.get("/api/today-subjects", authenticateToken, async (req, res) => {
  try {
    // Get today's day name (e.g., "Monday")
    const today = format(new Date(), "EEEE");

    // Find today's subjects from the Routine collection
    const routine = await Routine.findOne({ userId: req.user.id, day: today });

    if (!routine || routine.subjects.length === 0) {
      return res.json([]); // No subjects for today
    }

    // Extract subject names from the routine
    const subjectNames = routine.subjects.map((subject) => subject.name);

    // Get today's attendance records based on subjectName
    const attendanceRecords = await Attendance.find({
      userId: req.user.id,
      date: format(new Date(), "dd/MM/yyyy"),
      subjectname: { $in: subjectNames }, // Match subjects by name
    });

    // Map subjects with attendance data
    const subjectsWithAttendance = routine.subjects.map((subject) => {
      const attendance = attendanceRecords.find(
        (record) => record.subjectname === subject.name
      );

      return {
        name: subject.name,
        time: subject.time,
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
    let { subjectname, status, date } = req.body;

    if (!subjectname) {
      return res.status(400).json({ error: "Error in marking attendance" });
    }

    // Check if subject exists in the user's routine
    const routine = await Routine.findOne({
      userId: req.user.id,
      "subjects.name": subjectname,
    });

    if (!routine) {
      return res
        .status(404)
        .json({ error: "Subject not found in your routine." });
    }

    // Mark attendance
    const attendance = await Attendance.findOneAndUpdate(
      { userId: req.user.id, subjectname, date },
      { $set: { status } }, // Only update status
      { upsert: true, new: true }
    );

    res.json({ message: "Attendance recorded successfully!", attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//get attendance of each subject
app.get("/api/attendance", authenticateToken, async (req, res) => {
  try {
    // Fetch all routines for the user
    const routines = await Routine.find({ userId: req.user.id });

    // Extract unique subjects (use subject name for matching)
    const subjectMap = new Map();

    routines.forEach((routine) => {
      routine.subjects.forEach((subject) => {
        if (!subjectMap.has(subject.name)) {
          subjectMap.set(subject.name, {
            name: subject.name,
            total: 0,
            attended: 0,
          });
        }
      });
    });

    if (subjectMap.size === 0) {
      return res.json([]); // No subjects found
    }

    // Fetch all attendance records for the user
    const attendanceRecords = await Attendance.find({ userId: req.user.id });
    // res.json({routine:routines, attendanceData: attendanceRecords, subjectMap: subjectMap });

    // Map attendance to subjects
    attendanceRecords.forEach((record) => {
      const subjectEntry = subjectMap.get(record.subjectname);
      // console.log(record);

      if (subjectEntry) {
        subjectEntry.total += 1;
        if (record.status === true) {
          subjectEntry.attended += 1;
        }
      }
    });

    // Convert map to array
    const attendanceData = Array.from(subjectMap.values()).map((subject) => ({
      subjectName: subject.name,
      totalClasses: subject.total,
      attendedClasses: subject.attended,
      attendancePercentage: subject.total
        ? ((subject.attended / subject.total) * 100).toFixed(2)
        : "0.00",
    }));

    res.json(attendanceData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Multer configuration to handle image uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp to ensure unique filenames
//   },
// });

// const upload = multer({ storage });

// // Define the API route to accept the image and save routine
// app.post("/upload-image", upload.single("image"), async (req, res) => {
//   try {
//     const imagePath = req.file.path;

//     // Call OCR.space API to extract text from the image
//     const text = await extractTextFromImage(imagePath);

//     // Process the text to create a routine (based on your schema)
//     const routineData = processRoutine(text);

//     // Delete the uploaded image after processing
//     fs.unlinkSync(imagePath);

//     // Save the routine in MongoDB (replace with actual userId)
//     const userId = "some_user_id"; // Replace with actual userId from your app (probably from a session or JWT)
//     const routine = new Routine({
//       userId,
//       day: routineData.day,
//       subjects: routineData.subjects,
//     });

//     await routine.save();

//     // Return the parsed routine in the response
//     res.status(200).json({ message: "Routine saved successfully", routine });
//   } catch (error) {
//     console.error("Error processing image:", error);
//     res.status(500).json({ error: "Failed to process the image" });
//   }
// });

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
