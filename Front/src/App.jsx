import { useEffect, useState, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import TaskList from "./components/TaskList";
import Sidebard from "./components/Sidebard/Sidebard";
import { getCurrentUser } from "./services/authService";
import AdminDashboard from "./components/admin/AdminDashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const loggedOnce = useRef(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData.user);
        if (!loggedOnce.current) {
          loggedOnce.current = true;
        }
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
        {/* Login */}
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" /> : <Login onLoginSuccess={setUser} />
          }
        />

        {/* Página principal con tareas */}
        <Route
          path="/"
          element={
            user ? (
              <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] text-gray-200 overflow-hidden">
                <aside className="h-16 shadow-lg flex-shrink-0">
                  <Sidebard user={user} setUser={setUser} />
                </aside>
                <main className="flex-1 flex flex-col min-h-0">
                  <TaskList user={user} setUser={setUser} />
                </main>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Panel de configuración para admins */}
        <Route
          path="/config"
          element={
            user?.role === "admin" ? (
              <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] text-gray-200 overflow-hidden">
                <aside className="h-16 shadow-lg flex-shrink-0">
                  <Sidebard user={user} setUser={setUser} />
                </aside>
                <main className="flex-1 flex flex-col min-h-0">
                  <AdminDashboard />
                </main>
              </div>
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}
