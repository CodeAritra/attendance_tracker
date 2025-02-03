import { useEffect,  useState } from "react";
import { CalendarDays, Clock } from "lucide-react";
import Navigation from "../component/Navigation";
import axios from "axios";

export default function RoutinePage() {
  const [routine, setRoutine] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRoutine();
  }, []);

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

  return (
    <Navigation>
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <CalendarDays className="w-6 h-6 mr-2 text-indigo-600" />
              My Weekly Routine
            </h2>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {routine.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No routine uploaded yet.
              </p>
            ) : (
              routine.map((day) => (
                <div key={day._id} className="mb-6">
                  <h3 className="text-lg font-semibold text-indigo-700">
                    {day.day}
                  </h3>
                  <div className="space-y-3 mt-2">
                    {day.subjects.map((subject, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-100 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {subject.name}
                          </h4>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {subject.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Navigation>
  );
}
