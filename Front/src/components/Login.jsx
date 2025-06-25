import { useState, useEffect } from "react";
import { login } from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Loader from "./Loader/Loader";

export default function Login({ onLoginSuccess }) {
  const [initialLoading, setInitialLoading] = useState(true);
  const [redirectLoading, setRedirectLoading] = useState(false);

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Login2025*");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 2000); // Simula carga inicial

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const user = await login({ username, password });
      setSuccess(true);
      setFadeOut(true);
      setRedirectLoading(true); // Activar loader de redirección
      setTimeout(() => {
        onLoginSuccess?.(user); // Ir al dashboard o donde sea
      }, 2000); // Tiempo de transición antes de redirigir
    } catch (err) {
      setError(err.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-tr from-indigo-700 via-purple-700 to-pink-600 flex items-center justify-center px-4 overflow-hidden">
      {/* Fondos animados */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-pink-300 rounded-full opacity-20 blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full opacity-20 blur-[100px] animate-pulse-slow" />

      {/* Loader animado: al entrar y al redirigir */}
      <AnimatePresence>
        {(initialLoading || redirectLoading) && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50"
          >
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login card */}
      <AnimatePresence>
        {!initialLoading && !fadeOut && (
          <motion.div
            key="login-card"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:flex-row"
          >
            {/* Formulario */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="w-full p-8 sm:p-10 flex flex-col justify-center"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-8 drop-shadow-sm">
                Inicia sesión 🚀
              </h2>

              <form onSubmit={handleLogin} className="space-y-6">
                <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                  <input
                    type="text"
                    placeholder="Usuario"
                    className="w-full bg-white/10 text-white placeholder-white/70 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none transition-all"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </motion.div>

                <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    className="w-full bg-white/10 text-white placeholder-white/70 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none transition-all pr-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-white/60 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </motion.div>

                {error && (
                  <p className="text-center text-red-300 text-sm animate-pulse">
                    {error}
                  </p>
                )}

                {success && (
                  <motion.p
                    className="text-center text-green-300 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    ¡Login exitoso! 🎉
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Ingresar"
                  )}
                </button>
              </form>
            </motion.div>

            {/* Info visual a la derecha */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/5 backdrop-blur-lg p-6 sm:p-8 flex flex-col items-center justify-center text-white"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/3075/3075977.png"
                alt="Task Icon"
                className="w-24 sm:w-28 mb-4 animate-bounce-slow"
              />
              <h3 className="text-xl sm:text-2xl font-semibold text-center mb-3 drop-shadow">
                Bienvenido a tu gestor de tareas
              </h3>
              <p className="text-sm text-white/80 text-center max-w-xs leading-relaxed">
                Organiza tus actividades, mantén el control y alcanza tus metas.
              </p>
              <span className="mt-6 text-xs text-white/50">
                © {new Date().getFullYear()} DevTasks
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estilos utilitarios */}
      <style>{`
        .animate-pulse-slow {
          animation: pulse 8s infinite;
        }
        .animate-bounce-slow {
          animation: bounce 2.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
