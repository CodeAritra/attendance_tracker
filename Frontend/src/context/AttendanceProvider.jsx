/* eslint-disable react/prop-types */

import { useState } from "react";
import Tesseract from "tesseract.js";
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

  const handleFileUpload = async (event) => {
    if (!event.target.files || !event.target.files[0]) return;

    setSelectedFile(event.target.files[0]);
    setLoading(true);
    setError("");

    try {
      // Using Tesseract.js Worker directly
      const {
        data: { text },
      } = await Tesseract.recognize(event.target.files[0], "eng", {
        logger: (m) => console.log(m), // Optional logging for progress
      });

      // Clean and filter text
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 3 && !line.match(/^[0-9\s]*$/));

      // console.log("Extracted Text:", lines);

      // Extract Subject, Day & Time
      const extractedSubjects = lines.map((line) => {
        const timeMatch = line.match(/(\d{1,2}:\d{2}\s*[AaPp][Mm])/);
        const dayMatch = line.match(
          /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i
        );

        return {
          name: line
            .replace(timeMatch?.[0] || "", "")
            .replace(dayMatch?.[0] || "", "")
            .trim(),
          day: dayMatch ? dayMatch[0] : "Unknown",
          time: timeMatch ? timeMatch[0] : "9:00 AM",
        };
      });

      console.log("Routine :", extractedSubjects);


      // Send routine data to backend
      const response = await axios.post(
        "http://localhost:5000/api/routine",
        {
          routine: extractedSubjects,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRoutine(response.data);
      fetchTodaySubjects();
    } catch (error) {
      console.error("Error processing image:", error);
      setError("Failed to process the image. Please try again.");
    }

    setLoading(false);
  };

  const fetchRoutine = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/routine", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setRoutine(data);
      setError("");
    } catch (error) {
      console.error("Error fetching routine:", error);
      setError("Failed to load routine. Please refresh.");
    }
  };

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

  const markAttendance = async (subjectname, status) => {
    try {
      await axios.post(
        "http://localhost:5000/api/attendance",
        {
          subjectname,
          status,
          date: format(new Date(), "dd/MM/yyyy"),
        },
        {
          headers: { Authorization: `Bearer ${token}` }, // Send the token
        }
      );

      // console.log("Attendance updated:", data);

      // Update the state correctly
      setTodaySubjects((prev) =>
        prev.map((subject) =>
          subject.name === subjectname
            ? { ...subject, attendance: status }
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
      const res = await axios.get("http://localhost:5000/api/attendance", {
        headers: { Authorization: `Bearer ${token}` }, // Send the token
      });
      // console.log("data == ", res.data);
      setSubjects(res.data);
    } catch (error) {
      console.log("error : ", error);
    }
  };

  return (
    <AttendanceContext.Provider
      value={{
        fetchRoutine,
        handleFileUpload,
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
