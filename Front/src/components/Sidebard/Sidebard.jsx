import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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

/**
 * @param {{ user: { username?: string } | null, setUser: (v:any)=>void, showNotif?: (msg:string,type?:string)=>void }} props
 */
export default function Sidebard({ user, setUser, showNotif }) {
  const navigate = useNavigate();
  const location = useLocation();

  // --- Estado con persistencia ---
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem("sb:collapsed");
    return saved ? saved === "1" : false;
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("sb:dark");
    if (saved) return saved === "1";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
  });

  useEffect(() => {
    localStorage.setItem("sb:collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem("sb:dark", darkMode ? "1" : "0");
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  // --- Logout ---
  const handleLogout = async () => {
    try {
      await logout();
      setUser?.(null);
      navigate("/login");
    } catch {
      showNotif?.("Error al cerrar sesión", "error");
    }
  };

  // --- Rutas / items ---
  const items = useMemo(
    () => [
      { icon: Home, text: "Inicio", path: "/", shortcut: "Alt+I" },
      { icon: ListChecks, text: "Tareas", path: "/tareas", shortcut: "Alt+T" },
    ],
    []
  );

  const prefs = useMemo(
    () => [
      {
        icon: darkMode ? Sun : Moon,
        text: darkMode ? "Claro" : "Oscuro",
        onClick: () => setDarkMode((v) => !v),
        shortcut: "Alt+D",
      },
      { icon: Settings, text: "Config", path: "/config", shortcut: "Alt+C" },
    ],
    [darkMode]
  );

  // --- Atajos de teclado ---
  useEffect(() => {
    const onKey = (e) => {
      if (!e.altKey) return;
      const key = e.key.toLowerCase();
      if (key === "i") navigate("/");
      else if (key === "t") navigate("/tareas");
      else if (key === "d") setDarkMode((v) => !v);
      else if (key === "c") navigate("/config");
      else if (key === "q") handleLogout();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  // --- Tooltip clickeable (cuando sidebar está colapsado) ---
  const Tooltip = ({ text, targetRef, to, onClick, onHoverChange }) => {
    const rect = targetRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const spacing = 10;
    const est = Math.min(Math.max(text.length * 7 + 16, 80), 240);
    const willOverflowRight = rect.right + spacing + est > window.innerWidth;
    const x = willOverflowRight ? rect.left - spacing : rect.right + spacing;

    const midY = rect.top + rect.height / 2;
    const top = Math.min(Math.max(midY, 12), window.innerHeight - 12);

    const Common = ({ children }) => (
      <motion.div
        role="tooltip"
        initial={{ opacity: 0, x: willOverflowRight ? -8 : 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: willOverflowRight ? -8 : 8 }}
        transition={{ duration: 0.18 }}
        onMouseEnter={() => onHoverChange?.(true)}
        onMouseLeave={() => onHoverChange?.(false)}
        className="fixed z-[9999] px-2 py-1 text-[11px] text-white bg-black rounded shadow max-w-[240px] whitespace-nowrap cursor-pointer"
        style={{ top, left: x, transform: "translateY(-50%)" }}
      >
        {children}
      </motion.div>
    );

    return to ? (
      <Common>
        <NavLink to={to} onClick={onClick} className="outline-none">
          {text}
        </NavLink>
      </Common>
    ) : (
      <Common>
        <button type="button" onClick={onClick} className="outline-none">
          {text}
        </button>
      </Common>
    );
  };

  // --- Botón navegación ---
  const NavButton = ({ icon: Icon, text, path, onClick, shortcut }) => {
    const [hovered, setHovered] = useState(false);
    const [floating, setFloating] = useState(false); // mantiene abierto al pasar al tooltip
    const ref = useRef(null);

    const base =
      "flex items-center gap-3 px-3 py-2 w-full rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";
    const rest = collapsed ? "justify-center" : "";

    const handleGo = () => {
      if (path) navigate(path);
      else onClick?.();
    };

    // Si hay path usamos NavLink, si no, button
    if (path) {
      return (
        <Fragment>
          <div
            ref={ref}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="relative"
          >
            <NavLink
              to={path}
              aria-label={text}
              className={({ isActive }) =>
                [
                  base,
                  rest,
                  isActive ? "bg-indigo-800" : "hover:bg-indigo-700",
                ].join(" ")
              }
              onClick={(e) => {
                if (location.pathname === path) e.preventDefault();
              }}
            >
              <Icon size={20} className="text-white shrink-0" />
              {!collapsed && (
                <span className="text-white text-sm font-medium truncate">
                  {text}
                </span>
              )}
            </NavLink>
          </div>
          <AnimatePresence>
            {collapsed && (hovered || floating) && (
              <Tooltip
                text={`${text}${shortcut ? ` (${shortcut})` : ""}`}
                targetRef={ref}
                to={path}
                onClick={handleGo}
                onHoverChange={setFloating}
              />
            )}
          </AnimatePresence>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <div
          ref={ref}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative"
        >
          <button
            type="button"
            onClick={handleGo}
            aria-label={text}
            className={[base, rest, "hover:bg-indigo-700"].join(" ")}
          >
            <Icon size={20} className="text-white shrink-0" />
            {!collapsed && (
              <span className="text-white text-sm font-medium truncate">
                {text}
              </span>
            )}
          </button>
        </div>
        <AnimatePresence>
          {collapsed && (hovered || floating) && (
            <Tooltip
              text={`${text}${shortcut ? ` (${shortcut})` : ""}`}
              targetRef={ref}
              onClick={handleGo}
              onHoverChange={setFloating}
            />
          )}
        </AnimatePresence>
      </Fragment>
    );
  };

  const username = user?.username ?? "Usuario";
  const avatarSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    username
  )}&background=1e293b&color=fff`;

  return (
    <motion.aside
      aria-label="Barra lateral de navegación"
      layout
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.25 }}
      className="h-screen bg-[#0f172a] border-r border-indigo-800 shadow-lg shadow-indigo-900/40 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <h2 className="text-lg font-bold text-white tracking-wide">
            Panel
          </h2>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-pressed={collapsed}
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          className="text-white hover:text-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-md"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Avatar */}
      {!collapsed && (
        <div className="flex items-center gap-3 mb-4 px-4">
          <img
            src={avatarSrc}
            alt={`Avatar de ${username}`}
            className="w-10 h-10 rounded-full border border-indigo-500"
            loading="lazy"
            decoding="async"
          />
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">
              {username}
            </p>
            <p className="text-xs text-indigo-400">Administrador</p>
          </div>
        </div>
      )}

      {/* Navegación */}
      <div className="flex-1 flex flex-col gap-2 px-2">
        {!collapsed && (
          <p className="text-indigo-500 text-[11px] px-2 mt-4 uppercase tracking-wide">
            Gestión
          </p>
        )}

        {items.map((it) => (
          <NavButton key={it.text} {...it} />
        ))}

        {!collapsed && (
          <p className="text-indigo-500 text-[11px] px-2 mt-6 uppercase tracking-wide">
            Preferencias
          </p>
        )}
        {prefs.map((it) => (
          <NavButton key={it.text} {...it} />
        ))}
      </div>

      {/* Logout */}
      <div className="p-4">
        <NavButton icon={LogOut} text="Salir" onClick={handleLogout} shortcut="Alt+Q" />
      </div>
    </motion.aside>
  );
}
