import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./components/Register";
import Login from "./components/Login";
import CreateFilm from "./components/CreateFilm";
import MoviesList from "./components/MoviesList";
import BookingSeats from "./components/BookingSeats";

function ProtectedRoute({ children }) {
  // Si pas de token, on renvoie vers login
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  return (
    <div>
      <Navbar />

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
        <Route path="/create-film" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  );
}
export default App;