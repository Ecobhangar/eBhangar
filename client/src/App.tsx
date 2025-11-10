// client/src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard";
import CreateBooking from "./pages/create-booking";
import Profile from "./pages/profile";
import NotFound from "./pages/not-found";
import { useAuth } from "./context/AuthContext";

function PrivateRoute({ children }: any) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Protected pages */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/book" element={<PrivateRoute><CreateBooking /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}
