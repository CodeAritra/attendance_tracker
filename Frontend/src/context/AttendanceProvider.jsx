/* eslint-disable react/prop-types */

import { useState } from "react";
import Tesseract from "tesseract.js";
import AttendanceContext from "./AttendanceContext.js";
import axios from "axios";
import { format } from "date-fns";
import { URL } from "../url/url";

export const AttendanceProvider = ({ children }) => {
  const [routine, setRoutine] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [todaySubjects, setTodaySubjects] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
    const [showModal, setShowModal] = useState(false);
    const [subject, setSubject] = useState({ name: "", time: "" });

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
    setLoading(true);

    try {
      const { data } = await axios.get(`${URL}/api/routine/get`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Routine = ", data);

      setRoutine(data);
      setError("");
    } catch (error) {
      console.error("Error fetching routine:", error);
      setError("Failed to load routine. Please refresh.");
    }
    setLoading(false);
  };

  const fetchTodaySubjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${URL}/api/routine/today-subjects`, {
        headers: { Authorization: `Bearer ${token}` }, // Send the token
      });
      //  console.log("data == ", response);

      setTodaySubjects(response.data);
      setError("");
    } catch (error) {
      console.error("Error fetching today's subjects:", error);
      setError("Failed to fetch today's subjects. Please refresh the page.");
    }
    setLoading(false);
  };

  const deleteSubject = async (day, subjectName) => {
    try {
      await axios.delete(`${URL}/api/routine/delete`, {
        headers: { Authorization: `Bearer ${token}` }, // Send the token
        data: { day, subjectName }, // Axios requires `data` inside DELETE requests
      });
    } catch (error) {
      console.log("Error deleting subject:", error.response?.data || error.message);
    }
  };
  
  const markAttendance = async (subjectId, status) => {
    // ✅ Immediately update UI for a fast response
    setTodaySubjects((prev) =>
      prev.map((subject) =>
        subject.subjectId=== subjectId
          ? { ...subject, attendance: status }
          : subject
      )
    );

    try {
      // ✅ Send API request in the background
      await axios.post(
        `${URL}/api/attendance/mark`,
        {
          subjectId,
          status,
          date: format(new Date(), "dd/MM/yyyy"),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Error marking attendance:", error);
      setError("Failed to mark attendance. Please try again.");

      // ❌ Revert UI update if API fails
      setTodaySubjects((prev) =>
        prev.map((subject) =>
          subject.subjectId === subjectId
            ? { ...subject, attendance: null }
            : subject
        )
      );
    }
  };

  const countAttendance = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${URL}/api/attendance/get`, {
        headers: { Authorization: `Bearer ${token}` }, // Send the token
      });
      // console.log("data == ", res.data);
      setSubjects(res.data);
    } catch (error) {
      console.log("error : ", error);
    }
    setLoading(false);
  };

  //extra class
  const handleChange = (field, value) => {
    setSubject((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addExtraClass = async () => {
    try {
      const { data } = await axios.post(
        `${URL}/api/routine/extra-class`,
        { name: subject.name, time: subject.time }, // ✅ Request body goes here
        {
          headers: { Authorization: `Bearer ${token}` }, // ✅ Headers go here
        }
      );
      console.log("Data = ", data);
      fetchTodaySubjects();
    } catch (error) {
      console.log("Error adding extra class:", error);
    }
  };

  const handleAddExtraClass = () => {
    addExtraClass(subject);
    console.log("sub == ", subject);

    setSubject([]);
    setShowModal(false);
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
        deleteSubject,
        showModal, setShowModal,subject, setSubject,handleAddExtraClass,addExtraClass,handleChange
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export default AttendanceContext;
