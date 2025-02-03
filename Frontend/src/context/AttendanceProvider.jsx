/* eslint-disable react/prop-types */

import { useState } from "react";
import AttendanceContext from "./AttendanceContext.js";
import axios from "axios";
import { format } from "date-fns";

export const AttendanceProvider = ({ children }) => {
  const [routine, setRoutine] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [todaySubjects, setTodaySubjects] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const token = localStorage.getItem("token");

  const fetchTodaySubjects = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/today-subjects",
        {
          headers: { Authorization: `Bearer ${token}` }, // Send the token
        }
      );
      // console.log("data == ", response.data);

      setTodaySubjects(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching today's subjects:", error);
      setError("Failed to fetch today's subjects. Please refresh the page.");
    }
  };

  const markAttendance = async (subjectId, status) => {
    // console.log("date == ", format(new Date(), "dd/MM/yyyy"));

    try {
      await axios.post(
        "http://localhost:5000/api/attendance",
        {
          subjectId,
          status,
          date: format(new Date(), "dd/MM/yyyy"),
        },
        {
          headers: { Authorization: `Bearer ${token}` }, // Send the token
        }
      );

      setTodaySubjects((prev) =>
        prev.map((subject) =>
          subject._id === subjectId
            ? { ...subject, attendance: status ? true : false }
            : subject
        )
      );
    } catch (error) {
      console.error("Error marking attendance:", error);
      setError("Failed to mark attendance. Please try again.");
    }
  };

  const countAttendance = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/attendance",
        {
          headers: { Authorization: `Bearer ${token}` }, // Send the token
        }
      );
      console.log("data == ", res.data);
      setSubjects(res.data);
    } catch (error) {
      console.log("error : ", error);
    }
  };

  return (
    <AttendanceContext.Provider
      value={{
        subjects,
        setSubjects,
        countAttendance,
        routine,
        setRoutine,
        selectedFile,
        setSelectedFile,
        loading,
        setLoading,
        error,
        setError,
        fetchTodaySubjects,
        todaySubjects,
        setTodaySubjects,
        markAttendance,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export default AttendanceContext;
