/* eslint-disable react/prop-types */
import {
  Home,
  User,
  Settings,
  Menu,
  BarChart,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Layout({ children }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center fixed w-full top-0 z-50">
        <h1 className="text-xl font-bold text-gray-800 flex items-center">
          <Menu className="w-6 h-6 mr-2 md:hidden" />
          MyApp
        </h1>
        <div className="hidden md:flex space-x-6 ml-auto">
          <Link
            to="/"
            className="flex items-center text-gray-600 hover:text-indigo-600"
          >
            <Home className="w-5 h-5 mr-1" /> Home
          </Link>
          <Link
            to="/auth"
            className="flex items-center text-gray-600 hover:text-indigo-600"
          >
            <User className="w-5 h-5 mr-1" /> Profile
          </Link>
          <Link
            to="/a"
            className="flex items-center text-gray-600 hover:text-indigo-600"
          >
            <Settings className="w-5 h-5 mr-1" /> Settings
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 mt-12 mb-10 ">{children}</div>
      {/* Added `mt-16` to push content below the navbar and `mb-16` to avoid overlap with bottom navbar */}

      {/* Bottom Navigation (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-t-md p-4 flex justify-around sm:hidden z-50">
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
            <User className="w-6 h-6" />
            <span className="text-xs flex items-center">
              Profile <ChevronDown className="w-3 h-3 ml-1" />
            </span>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-1 bottom-10  bg-gray-100 shadow-md rounded-md p-2  w-40 text-sm">
              <Link
                to="/upload"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                Upload Class Routine
              </Link>
              <Link
                to="#"
                className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                Login/Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
