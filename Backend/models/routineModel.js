import mongoose from "mongoose";


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

const Routine = mongoose.model("Routine", routineSchema);
export default Routine;

