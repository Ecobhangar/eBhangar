import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import CreateBooking from "./pages/create-booking";
import NotFound from "./pages/not-found";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Default route */}
        <Route path="/" element={<Home />} />

        {/* ✅ Login page */}
        <Route path="/login" element={<Login />} />

        {/* ✅ Book pickup / create booking */}
        <Route path="/book" element={<CreateBooking />} />

        {/* ✅ Catch-all fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
