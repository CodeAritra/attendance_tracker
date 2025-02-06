import { useState } from "react";
import Navigation from "../component/Navigation";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { URL } from "../url/url";


const RoutineUploader = () => {
  const [day, setDay] = useState("");
  const [subjects, setSubjects] = useState([{ name: "", time: "" }]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index][field] = value;
    setSubjects(updatedSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: "", time: "" }]);
  };

  const removeSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleSubmitRoutine = async () => {
    try {
      const response = await axios.post(
        `${URL}/api/routine/add`,
        {
          day,
          subjects,
        },
        {
          headers: { Authorization: `Bearer ${token}` }, // Send the token
        }
      );
      console.log("routine uploader = ", response.data);

      //   alert(response.data.message);
      navigate("/");
      setDay("");
      setSubjects([{ name: "", time: "" }]);
    } catch (error) {
      alert("Error: " + error.response.data.error);
    }
  };

  return (
    <Navigation>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mt-5 p-6 w-[90%] md:w-[55%] max-w-xl mx-auto bg-white shadow-xl rounded-2xl h-auto max-h-[80vh] overflow-y-auto"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Upload Routine
        </h2>

        {/* Day Selector */}
        <motion.select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="border p-3 w-full rounded-md bg-gray-100 focus:ring focus:ring-indigo-300"
          whileFocus={{ scale: 1.02 }}
        >
          <option value="">Select Day</option>
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </motion.select>

        {/* Subject Inputs */}
        <div className="w-full space-y-2 mt-3">
          {subjects.map((subject, index) => (
            <motion.div
              key={index}
              className="flex gap-2 w-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <input
                type="text"
                placeholder="Subject Name"
                value={subject.name}
                onChange={(e) =>
                  handleSubjectChange(index, "name", e.target.value)
                }
                className="border p-3 md:w-64 md:flex-1 w-35 flex-none  rounded-md bg-gray-100 focus:ring focus:ring-indigo-300"
              />
              <input
                type="text"
                placeholder="Time"
                value={subject.time}
                onChange={(e) =>
                  handleSubjectChange(index, "time", e.target.value)
                }
                className="border p-3 md:w-60 md:flex-1 w-26 flex-none rounded-md bg-gray-100 focus:ring focus:ring-indigo-300"
              />
              <motion.button
                onClick={() => removeSubject(index)}
                className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600"
                whileHover={{ scale: 1.1 }}
              >
                X
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Buttons */}
        <motion.button
          onClick={addSubject}
          className="bg-blue-500 text-white px-5 py-2 mt-3 rounded-md hover:bg-blue-600"
          whileHover={{ scale: 1.05 }}
        >
          + Add Subject
        </motion.button>

        <motion.button
          onClick={handleSubmitRoutine}
          className="bg-green-500 text-white px-6 py-2 mt-3 rounded-md hover:bg-green-600"
          whileHover={{ scale: 1.05 }}
        >
          Submit
        </motion.button>
      </motion.div>
    </Navigation>
  );
};

export default RoutineUploader;
