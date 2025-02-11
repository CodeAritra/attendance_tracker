/* eslint-disable react/prop-types */
import {
  Home,
  User,
  BarChart,
  ChevronDown,
  BookOpen,
  LogOut,
  LogIn,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Nvaigation({ children }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handlelogout = () => {
    console.log("Logout");

    localStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-md p-4 flex justify-between items-center fixed w-full top-0 z-100"
      >
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
          Attendance Tracker
        </h1>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 ml-auto">
          {[
            { to: "/", icon: Home, label: "Home" },
            { to: "/routine", icon: BookOpen, label: "Routine" },
            { to: "/attendance", icon: BarChart, label: "Attendance" },
          ].map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200"
            >
              <Icon className="w-5 h-5 mr-1" />
              <span>{label}</span>
            </Link>
          ))}

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200 focus:outline-none cursor-pointer"
            >
              <User className="w-6 h-6 mr-1" />
              <span className="text-sm flex items-center">
                Profile <ChevronDown className="w-3 h-3 ml-1" />
              </span>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-0 top-10 bg-white shadow-md rounded-md p-2 w-44 text-sm border border-gray-200"
                >
                  <Link
                    to="/upload"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    Upload Routine
                  </Link>
                  {token ? (
                    <button
                      onClick={handlelogout}
                      className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </button>
                  ) : (
                    <Link
                      to="/auth"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                    >
                      <LogIn className="w-4 h-4 mr-2" /> Login
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto mt-16 pb-20 ">{children}</div>

      {/* Bottom Navigation (Mobile Only) */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed bottom-0 left-0 right-0 bg-white shadow-t-md p-4 flex justify-around sm:hidden z-50"
      >
        <Link
          to="/"
          className="flex flex-col items-center text-gray-600 hover:text-indigo-600"
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </Link>
        <Link
          to="/routine"
          className="flex flex-col items-center text-gray-600 hover:text-indigo-600"
        >
          <BookOpen className="w-6 h-6" />
          <span className="text-xs">Routine</span>
        </Link>
        <Link
          to="/attendance"
          className="flex flex-col items-center text-gray-600 hover:text-indigo-600"
        >
          <BarChart className="w-6 h-6" />
          <span className="text-xs">Attendance</span>
        </Link>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex flex-col items-center text-gray-600 hover:text-indigo-600 focus:outline-none"
          >
            <User className="w-6 h-6 mr-3" />
            <span className="text-xs flex items-center">
              Profile <ChevronDown className="w-3 h-3 ml-1" />
            </span>
          </button>
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute right-1 bottom-10 bg-gray-100 shadow-md rounded-md p-2 w-40 text-sm"
              >
                <Link
                  to="/upload"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
                >
                  Upload Routine
                </Link>
                {token ? (
                  <button
                    onClick={handlelogout}
                    className="flex items-center px-4 py-2 text-red-600 hover:bg-gray-100 w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    <LogIn className="w-4 h-4 mr-2" /> Login
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
