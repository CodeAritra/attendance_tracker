import mongoose from "mongoose";


const attendanceSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  subjectId: mongoose.Schema.Types.ObjectId,
  subjectname: String,
  date: String,
  status: Boolean,
});

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
