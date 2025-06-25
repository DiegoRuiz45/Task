import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  LogOut,
  Menu,
  ListChecks,
  Settings,
  Sun,
  Moon,
} from "lucide-react";
import { logout } from "../../services/authService";

function Sidebard({ user, setUser, showNotif }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // puedes integrarlo con tu context global

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate("/login");
    } catch {
      showNotif?.("Error al cerrar sesión", "error");
    }
  };

  const Tooltip = ({ text, targetRef }) => {
    const rect = targetRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const spacing = 8;
    const tooltipWidth = text.length * 8 + 16;
    const overflowRight = rect.right + spacing + tooltipWidth > window.innerWidth;

    return (
      <motion.div
        initial={{ opacity: 0, x: overflowRight ? -10 : 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: overflowRight ? -10 : 10 }}
        transition={{ duration: 0.2 }}
        className="fixed z-[9999] px-2 py-1 text-xs text-white bg-black rounded shadow pointer-events-none whitespace-nowrap"
        style={{
          top: rect.top + rect.height / 2,
          left: overflowRight ? rect.left - tooltipWidth - spacing : rect.right + spacing,
          transform: "translateY(-50%)",
        }}
      >
        {text}
      </motion.div>
    );
  };

  const NavButton = ({ icon: Icon, text, path, onClick, shortcut }) => {
    const [hovered, setHovered] = useState(false);
    const ref = useRef();
    const active = path && location.pathname.includes(path);

    return (
      <>
        <div
          ref={ref}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative"
        >
          <button
            onClick={onClick || (() => navigate(path))}
            className={`flex items-center gap-3 px-3 py-2 w-full rounded-md transition-colors ${
              active ? "bg-indigo-800" : "hover:bg-indigo-700"
            }`}
          >
            <Icon size={20} className="text-white" />
            {!collapsed && (
              <span className="text-white text-sm font-medium">{text}</span>
            )}
          </button>
        </div>
        {collapsed && hovered && (
          <Tooltip text={`${text}${shortcut ? ` (${shortcut})` : ""}`} targetRef={ref} />
        )}
      </>
    );
  };

  return (
    <motion.aside
      layout
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.3 }}
      className="h-screen bg-[#0f172a] border-r border-indigo-800 shadow-lg shadow-indigo-900/40 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <h2 className="text-lg font-bold text-white tracking-wide">Panel</h2>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="text-white">
          <Menu size={20} />
        </button>
      </div>

      {/* Avatar */}
      {!collapsed && (
        <div className="flex items-center gap-3 mb-4 px-4">
          <img
            src={`https://ui-avatars.com/api/?name=${user.username}&background=1e293b&color=fff`}
            className="w-10 h-10 rounded-full border border-indigo-500"
          />
          <div>
            <p className="text-white text-sm font-semibold">{user.username}</p>
            <p className="text-xs text-indigo-400">Administrador</p>
          </div>
        </div>
      )}

      {/* Sección navegación */}
      <div className="flex-1 flex flex-col gap-2 px-2">
        {!collapsed && <p className="text-indigo-500 text-xs px-2 mt-4">Gestión</p>}
        <NavButton icon={Home} text="Inicio" path="/" shortcut="Alt+I" />
        <NavButton icon={ListChecks} text="Tareas" path="/tareas" shortcut="Alt+T" />

        {!collapsed && <p className="text-indigo-500 text-xs px-2 mt-6">Preferencias</p>}
        <NavButton
          icon={darkMode ? Sun : Moon}
          text={darkMode ? "Claro" : "Oscuro"}
          onClick={() => setDarkMode(!darkMode)}
          shortcut="Alt+D"
        />
        <NavButton icon={Settings} text="Config" path="/config" shortcut="Alt+C" />
      </div>

      {/* Logout */}
      <div className="p-4">
        <NavButton icon={LogOut} text="Salir" onClick={handleLogout} shortcut="Alt+Q" />
      </div>
    </motion.aside>
  );
}

export default Sidebard;
