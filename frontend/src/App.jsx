import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import EventsPage from "./pages/EventsPage";
import AttendancePage from "./pages/AttendancePage";
import LandingPage from "./pages/LandingPage";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <div className="app-container">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/events" element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/attendance" element={
              <ProtectedRoute>
                <AttendancePage />
              </ProtectedRoute>
            } />
            

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;