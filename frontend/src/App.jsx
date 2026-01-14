import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Portfolio from "./pages/Portfolio";
import Risk from "./pages/Risk";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { AuthService } from "./services/AuthService";
import "./App.css";

/* ---------- Simple Page Components ---------- */

const PageWrapper = ({ title, subtitle, link, linkText }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-lg text-gray-600 mb-6">{subtitle}</p>
      <Link
        to={link}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {linkText}
      </Link>
    </div>
  </div>
);

/* ---------- App Component ---------- */

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <span className="text-xl font-bold">
            Crypto Investment Manager
          </span>
          <div className="space-x-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-black">Dashboard</Link>
            <Link to="/portfolio" className="text-gray-600 hover:text-black">Portfolio</Link>
            <Link to="/risk" className="text-gray-600 hover:text-black">Risk</Link>
            <Link to="/reports" className="text-gray-600 hover:text-black">Reports</Link>
            <Link to="/alerts" className="text-gray-600 hover:text-black">Alerts</Link>
          </div>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/risk" element={<Risk />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/alerts" element={<Alerts />} />
      </Routes>
    </div>
  );
}

export default App;
