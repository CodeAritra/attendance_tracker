import { useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import Navigation from "../component/Navigation";
import AttendanceContext from "../context/AttendanceContext.js";

export default function Dashboard() {
  const { markAttendance, fetchTodaySubjects, todaySubjects } =
    useContext(AttendanceContext);

  useEffect(() => {
    fetchTodaySubjects();
  }, []);

  return (
    <Navigation>
      <div className="bg-gray-50 min-h-screen flex justify-center">
        <div
          className="max-w-4xl w-full mx-auto p-6"
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
          >
            {/* Today's Subjects */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-white rounded-lg"
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                Classes for today
              </h2>

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
            </motion.div>
          </div>
        </div>
      </div>
    </Navigation>
  );
}
