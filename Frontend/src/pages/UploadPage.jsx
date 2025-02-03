import { Upload } from "lucide-react";
import { useContext } from "react";
import AttendanceContext from "../context/AttendancePRovider";
import Navigation from "../component/Navigation";

export default function UploadPage() {
  const { handleFileUpload,loading,error } = useContext(AttendanceContext);

  return (
    <>
      {/* File Upload Section */}
      <Navigation>
        <div className="min-h-screen">
          <div className="max-w-4xl mx-auto p-6">
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
