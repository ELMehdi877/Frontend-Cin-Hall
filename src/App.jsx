import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import Login from "./components/Login";
import CreateFilm from "./components/CreateFilm";
import MoviesList from "./components/MoviesList";
import BookingSeats from "./components/BookingSeats";
import Profile from "./components/Profile";
import RoomManager from "./components/RoomManager";
import SessionManager from "./components/SessionManager";
import ReservationSessions from "./components/ReservationSessions";

function ProtectedRoute({ children }) {
  // Si pas de token, on renvoie vers login
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <main className={isSidebarCollapsed ? "md:ml-20" : "md:ml-64"}>
        <Routes>
          <Route path="/" element={<Navigate to="/movies" />} />
          <Route path="/movies" element={<MoviesList />} />
          <Route path="/booking/:sessionId" element={<BookingSeats />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <CreateFilm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rooms"
            element={
              <ProtectedRoute>
                <RoomManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions-manager"
            element={
              <ProtectedRoute>
                <SessionManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservation-sessions"
            element={
              <ProtectedRoute>
                <ReservationSessions />
              </ProtectedRoute>
            }
          />
          <Route path="/create-film" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}
export default App;