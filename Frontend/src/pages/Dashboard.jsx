import { useEffect, useContext } from "react";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import Navigation from "../component//Navigation";

import AttendanceContext from "../context/AttendanceContext.js";

export default function Dashboard() {
  const { markAttendance, fetchTodaySubjects, todaySubjects } =
    useContext(AttendanceContext);

  useEffect(() => {
    fetchTodaySubjects();
  }, []);

  //  useEffect(() => {
  //    console.log(todaySubjects.length);
  //    ;
  //  }, [todaySubjects]);

  return (
    <Navigation>
      <div className="bg-gray-50">
        <div className="max-w-4xl  mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            {/* Today's Subjects */}
            <div className="  bg-white rounded-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                Classes for today
              </h2>

              {todaySubjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No classes scheduled for today
                </div>
              ) : (
                <div className="space-y-4">
                  {todaySubjects.map((subject) => (
                    <div
                      key={subject.name}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Navigation>
  );
}
