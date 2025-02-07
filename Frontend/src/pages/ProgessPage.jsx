import { useContext, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "../component/Navigation";
import { Calendar } from "lucide-react";
import Loader from "../component/Loader.jsx";
import AttendanceContext from "../context/AttendanceContext.js";

export default function ProgressPage() {
  const { loading, subjects, countAttendance } = useContext(AttendanceContext);

  useEffect(() => {
    countAttendance();
  }, []);

  return (
    <>
      <Navigation>
        {loading ? (
          <>
            <Loader />
          </>
        ) : (
          <>
            <div className="bg-gray-50  max-h-screen">
              <div className="max-w-4xl mx-auto p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-lg shadow-lg p-4"
                >
                  {/* Attendance Header */}
                  <div className="mb-4 ml-1">
                    <h2 className="text-xl font-semibold flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                      Your Attendance
                    </h2>
                  </div>

                  {/* Attendance Cards */}
                  {subjects.length === 0 ? (
                    <>
                      <p className="text-gray-500 text-center py-8">
                        No routine uploaded yet.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map((subject) => (
                          <motion.div
                            key={subject._id} // Ensure unique key
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="bg-gray-50 shadow-lg rounded-2xl p-4">
                              <h2 className="text-lg font-semibold">
                                {subject.subjectName}
                              </h2>
                              <p className="text-gray-500">
                                Attended: {subject.attendedClasses} /{" "}
                                {subject.totalClasses}
                              </p>
                              <div className="w-full bg-gray-400 rounded-full h-2.5 mt-2">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full"
                                  style={{
                                    width: `${subject.attendancePercentage}%`,
                                  }}
                                ></div>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {subject.attendancePercentage}% Attendance
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </>
        )}
      </Navigation>
    </>
  );
}
