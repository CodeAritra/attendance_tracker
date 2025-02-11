import Routine from "../models/routineModel.js";
import Attendance from "../models/attendanceModel.js";
import ExtraClass from "../models/extraClassModel.js";

// Mark Attendance (Auth required)
export const markAttendance = async (req, res) => {
  try {
    let { subjectId, status, date } = req.body;

    if (!subjectId) {
      return res.status(400).json({ error: "Subject ID is required" });
    }

    // Search for subject in Routine collection
    let routine = await Routine.findOne(
      { userId: req.user.id, "subjects._id": subjectId },
      { "subjects.$": 1 } // Get only the matching subject
    );

    // If not found in Routine, search in ExtraClass collection
    if (!routine) {
      routine = await ExtraClass.findOne(
        { userId: req.user.id, "subjects._id": subjectId },
        { "subjects.$": 1 }
      );
    }

    // If subject is not found in either, return error
    if (!routine || routine.subjects.length === 0) {
      return res.status(404).json({ error: "Subject not found in your routine or extra classes." });
    }

    // Extract the exact subject that matches the subjectId
    const subject = routine.subjects.find((sub) => sub._id.toString() === subjectId);

    if (!subject) {
      return res.status(404).json({ error: "Subject not found." });
    }

    // Mark attendance using subjectId
    const attendance = await Attendance.findOneAndUpdate(
      { userId: req.user.id, subjectId, date }, // Use subjectId for marking attendance
      { $set: { status, subjectname: subject.name } }, // Store only the matched subject name
      { upsert: true, new: true }
    );

    res.json({
      message: "Attendance recorded successfully!",
      attendance: {
        subjectId,
        subjectname: subject.name, // Return only the matched subject name
        status,
        date,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



//get attendance of each subject
export const getAttendance = async (req, res) => {
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
};
