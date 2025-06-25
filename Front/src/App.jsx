import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import TaskList from "./components/TaskList";
import Sidebard from "./components/Sidebard/Sidebard";
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
          element={
            user ? <Navigate to="/" /> : <Login onLoginSuccess={setUser} />
          }
        />
        <Route
          path="/"
          element={
            user ? (
              <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] text-gray-200 overflow-hidden">
                {/* Sidebar fijo a la izquierda en desktop, arriba en mobile */}
                <aside className="md:w-64 w-full md:h-full h-16 shadow-lg flex-shrink-0">
                  <Sidebard user={user} setUser={setUser} />
                </aside>

                {/* Área principal con scroll interno */}
                <main className="flex-1 flex flex-col min-h-0">
                  <TaskList user={user} setUser={setUser} />
                </main>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}
