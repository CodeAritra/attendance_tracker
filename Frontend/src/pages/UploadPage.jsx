import Tesseract from "tesseract.js";
import { Upload } from "lucide-react";
import axios from "axios";
import { useContext } from "react";
import AttendanceContext from "../context/AttendancePRovider";
import Navigation from "../component/Navigation";

export default function UploadPage() {
  const {
    setRoutine,
    setSelectedFile,
    loading,
    setLoading,
    error,
    setError,
    fetchTodaySubjects,
  } = useContext(AttendanceContext);

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

      console.log("Extracted Text:", lines);

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

      // Send routine data to backend
      const response = await axios.post("http://localhost:5000/api/routine", {
        routine: extractedSubjects,
      });

      setRoutine(response.data);
      fetchTodaySubjects();
    } catch (error) {
      console.error("Error processing image:", error);
      setError("Failed to process the image. Please try again.");
    }

    setLoading(false);
  };

  return (
    <>
      {/* File Upload Section */}
      <Navigation>
        <div className="min-h-screen">
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8"></div>
            <div className="mb-8">
              <label className="flex flex-col items-center px-4 py-6 bg-gray-50 text-gray-500 rounded-lg border-2 border-dashed cursor-pointer hover:bg-gray-100 transition duration-300">
                <Upload className="w-12 h-12 mb-2 text-indigo-600" />
                <span className="text-sm font-medium">
                  Upload Class Routine Image
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  Supported formats: PNG, JPG, JPEG
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Processing image...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                {error}
              </div>
            )}
          </div>
        </div>
      </Navigation>
    </>
  );
}
