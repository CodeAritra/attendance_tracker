import { useEffect, useContext } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  PlusCircle,
  X,
} from "lucide-react";
import Navigation from "../component/Navigation";
import AttendanceContext from "../context/AttendanceContext.js";
import Loader from "../component/Loader.jsx";

export default function Dashboard() {
  const {
    loading,
    markAttendance,
    fetchTodaySubjects,
    todaySubjects,
    showModal,
    setShowModal,
    subject,
    handleAddExtraClass,
    handleChange,
  } = useContext(AttendanceContext);

  useEffect(() => {
    fetchTodaySubjects();
  }, []);

  return (
    <Navigation>
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-gray-50 max-h-screen flex justify-center overflow-hidden">
          <div className="max-w-4xl w-full mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              {/* Header with Add Button */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex justify-between items-center mb-4"
              >
                <h2 className="text-xl font-semibold flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                  Classes for today
                </h2>
                <button
                  onClick={() => setShowModal(true)}
                  title="Add Extra Class"
                >
                  <PlusCircle className="w-6 h-6 text-indigo-600 hover:text-indigo-800 transition" />
                </button>
              </motion.div>

              {/* Display Routine */}
              {todaySubjects.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-8 text-gray-500"
                >
                  No classes scheduled for today
                </motion.div>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { staggerChildren: 0.1 },
                    },
                  }}
                  className="space-y-4"
                >
                  {todaySubjects.map((subject) => (
                    <motion.div
                      key={subject.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition duration-200"
                    >
                      <div>
                        <h3 className="font-medium text-gray-800">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {subject.time}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => markAttendance(subject.name, true)}
                          className={`p-2 rounded-full transition duration-200 ${
                            subject.attendance === true
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
                          }`}
                          title="Mark as present"
                        >
                          <CheckCircle className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => markAttendance(subject.name, false)}
                          className={`p-2 rounded-full transition duration-200 ${
                            subject.attendance === false
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600"
                          }`}
                          title="Mark as absent"
                        >
                          <XCircle className="w-6 h-6" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal for Adding Extra Class */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-gray-50 bg-opacity-30 backdrop-blur-md z-50 p-5"
          onClick={() => setShowModal(false)} // Click outside to close
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-lg w-96 relative"
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-lg font-semibold mb-4">Add Extra Class</h3>
            <input
              type="text"
              placeholder="Subject Name"
              value={subject.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full p-2 border rounded-md mb-3"
            />
            <input
              type="text"
              placeholder="Time"
              value={subject.time}
              onChange={(e) => handleChange("time", e.target.value)}
              className="w-full p-2 border rounded-md mb-3"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                disabled={loading}
                onClick={handleAddExtraClass}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </Navigation>
  );
}
