import { useContext, useEffect, useState } from "react";
import { CalendarDays, Clock, Trash2, Edit3, Check } from "lucide-react";
import Navigation from "../component/Navigation";
import AttendanceContext from "../context/AttendanceContext.js";
import Loader from "../component/Loader.jsx";
import { motion } from "framer-motion";

export default function RoutinePage() {
  const { loading, fetchRoutine, routine, deleteSubject } = useContext(AttendanceContext);
  const [editMode, setEditMode] = useState(false); // Track edit mode

  useEffect(() => {
    fetchRoutine();
  }, []);

  const handleDelete = async (day, subjectName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${subjectName}?`);
    if (confirmDelete) {
      await deleteSubject(day, subjectName);
      fetchRoutine(); // Refresh routine after deletion
    }
  };

  return (
    <Navigation>
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-gray-50 max-h-screen">
          <div className="max-w-4xl mx-auto pb-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-lg p-6 mb-8"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold flex items-center">
                  <CalendarDays className="w-6 h-6 mr-2 text-indigo-600" />
                  My Weekly Routine
                </h2>
                <button onClick={() => setEditMode(!editMode)} className="text-gray-600 hover:text-gray-800">
                  {editMode ? <Check className="w-6 h-6 text-green-600" /> : <Edit3 className="w-6 h-6" />}
                </button>
              </div>

              {routine.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No routine uploaded yet.
                </p>
              ) : (
                routine.map((day) => (
                  <div key={day._id} className="mb-6 mt-5">
                    <h3 className="text-lg font-semibold text-indigo-700">{day.day}</h3>
                    <div className="space-y-3 mt-2">
                      {day.subjects.map((subject, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-100 rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium text-gray-800">{subject.name}</h4>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {subject.time}
                            </p>
                          </div>
                          {editMode && (
                            <motion.button
                              onClick={() => handleDelete(day.day, subject.name)}
                              className="text-red-500 hover:text-red-700"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      )}
    </Navigation>
  );
}
