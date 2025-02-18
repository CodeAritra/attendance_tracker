import Routine from "../models/routineModel.js";
import Attendance from "../models/attendanceModel.js";
import { format } from "date-fns";
import ExtraClass from "../models/extraClassModel.js";

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
export const addRoutine = async (req, res) => {
  try {
    const { day, subjects } = req.body;

    // Ensure user is authenticated
    const userId = req.user.id;
    if (!day || !subjects) {
      return res
        .status(400)
        .json({ success: false, error: "Day and subjects are required." });
    }

    // Find existing routine for the user and day
    const existingRoutine = await Routine.findOne({ userId, day });

    if (existingRoutine) {
      // Merge existing subjects with new subjects
      const updatedSubjects = [...existingRoutine.subjects, ...subjects];

      // Remove duplicate subjects (based on name and time)
      const uniqueSubjects = updatedSubjects.filter(
        (subject, index, self) =>
          index ===
          self.findIndex(
            (s) => s.name === subject.name && s.time === subject.time
          )
      );

      // Update routine with merged subjects
      existingRoutine.subjects = uniqueSubjects;
      await existingRoutine.save();
      return res.status(200).json({
        success: true,
        message: "Routine updated successfully!",
        routine: existingRoutine,
      });
    }

    // Create a new routine if not found
    const newRoutine = new Routine({ userId, day, subjects });
    await newRoutine.save();
    return res.status(201).json({
      success: true,
      message: "Routine added successfully!",
      routine: newRoutine,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get routine
export const getRoutine = async (req, res) => {
  try {
    const routine = await Routine.find({ userId: req.user.id });

    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    // Sort routines by day
    routine.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

    // Sort subjects within each day's routine based on start time
    routine.forEach((entry) => {
      entry.subjects.sort((a, b) => {
        const getTimeInMinutes = (timeRange) => {
          const startTime = timeRange.split("-")[0]; // Extract start time
          const [hours, minutes] = startTime.split(":").map(Number);
          return hours * 60 + minutes; // Convert to minutes for easy comparison
        };
        return getTimeInMinutes(a.time) - getTimeInMinutes(b.time);
      });
    });

    res.json(routine);
  } catch (error) {
    console.error("Error fetching routine:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const deleteSubject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { day, subjectName } = req.body;

    // Find the routine for the given user and day
    const routine = await Routine.findOne({ userId, day });

    if (!routine) {
      return res
        .status(404)
        .json({ message: "Routine not found for this day" });
    }

    // Filter out the subject to delete
    routine.subjects = routine.subjects.filter(
      (subject) => subject.name !== subjectName
    );

    // Save the updated routine
    await routine.save();

    res.status(200).json({ message: "Subject deleted successfully", routine });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const extraClass = async (req, res) => {
  try {
    const userId = req.user.id;
    const day = format(new Date(), "EEEE");
    const date = format(new Date(), "yyyy-MM-dd");
    const { name, time } = req.body;

    const updatedExtraClass = await ExtraClass.findOneAndUpdate(
      { userId, date }, // Ensure uniqueness per user
      { $push: { subjects: { name, time } }, $set: { date } },
      { new: true, upsert: true } // Prevent duplicate inserts
    );

    res.json({ success: true, updatedExtraClass });
  } catch (error) {
    res.status(500).json({ success: false, message: "Extra class error", error });
  }
};

// Get Today's Subjects (Auth required)
export const getSubject = async (req, res) => {
  try {
    // Get today's day name (e.g., "Monday")
    const today = format(new Date(), "EEEE");
    const date = format(new Date(), "yyyy-MM-dd");

    // Find today's subjects from the Routine collection
    const routine = await Routine.findOne({ userId: req.user.id, day: today });
    const extraClass = await ExtraClass.findOne({
      userId: req.user.id,
      date
    });

    if (!routine || routine.subjects.length === 0) {
      return res.json([]); // No subjects for today
    }

    // Combine regular and extra class subjects
    const todaySubjects = {
      userId: routine?.userId || "",
      day: routine?.day || "",
      subjects: [...(routine?.subjects || []), ...(extraClass?.subjects || [])],
    };

    // Extract subject IDs
    const subjectIds = todaySubjects.subjects.map((subject) => subject._id);

    // Get today's attendance records based on subjectId
    const attendanceRecords = await Attendance.find({
      userId: req.user.id,
      date: format(new Date(), "dd/MM/yyyy"),
      subjectId: { $in: subjectIds }, // Match attendance by subjectId
    });

    // Map subjects with attendance data
    const subjectsWithAttendance = todaySubjects.subjects.map((subject) => {
      const attendance = attendanceRecords.find(
        (record) => record.subjectId.toString() === subject._id.toString() // Ensure proper ID comparison
      );

      return {
        subjectId: subject._id,
        name: subject.name,
        time: subject.time,
        attendance: attendance ? attendance.status : null,
      };
    });

    res.json(subjectsWithAttendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


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
