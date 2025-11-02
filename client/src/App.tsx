import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CreateBooking from "./pages/create-booking";
import Profile from "./pages/profile"; // ✅ Added
import Dashboard from "./pages/dashboard"; // ✅ Added
import NotFound from "./pages/not-found";

// ✅ eBhangar App Routing — Stable for Vite + Render
export default function App() {
  return (
    <Router basename="/">
      <Routes>
        {/* 🏠 Home Page */}
        <Route path="/" element={<Home />} />

        {/* 🔐 Login Page */}
        <Route path="/login" element={<Login />} />

        {/*♻️ Create Booking Page */}
        <Route path="/book" element={<CreateBooking />} />

        {/* 👤 Profile Page */}
        <Route path="/profile" element={<Profile />} />  {/* ✅ Added */}

        {/* 📊 Dashboard Page */}
        <Route path="/dashboard" element={<Dashboard />} />  {/* ✅ Added */}

        {/* ❌ Catch-all (404) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
