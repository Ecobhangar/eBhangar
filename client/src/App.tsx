// client/src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/dashboard";
import CreateBooking from "./pages/create-booking";
import Profile from "./pages/profile";
import NotFound from "./pages/not-found";
import { useAuth } from "./context/AuthContext";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Normal home */}
        <Route path="/" element={<Home />} />

        {/* Agar kabhi /index.html open ho jaye to home pe bhej do */}
        <Route path="/index.html" element={<Navigate to="/" replace />} />

        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/book"
          element={
            <PrivateRoute>
              <CreateBooking />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
