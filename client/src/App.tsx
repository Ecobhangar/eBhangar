import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard";
import CreateBooking from "./pages/create-booking";
import Profile from "./pages/profile";
import NotFound from "./pages/not-found";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* ✅ Correct Dashboard Route */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* ✅ Correct Booking Route */}
        <Route path="/book" element={<CreateBooking />} />

        {/* ✅ Profile Page */}
        <Route path="/profile" element={<Profile />} />

        {/* ❌ Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
