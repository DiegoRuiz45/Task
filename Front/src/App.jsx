import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import TaskList from "./components/TaskList";
import { getCurrentUser } from "./services/authService"; // ahora te doy esta

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // para evitar parpadeo

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) return <div className="text-white p-4">Cargando...</div>;

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login onLoginSuccess={setUser} />}
        />
        <Route
          path="/"
          element={user ? <TaskList user={user} setUser={setUser} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}
