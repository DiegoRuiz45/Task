import { useState, useEffect } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";
import Notification from "../components/Notification";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Trash2, PlusCircle, AlertTriangle } from "lucide-react";
import TaskModal from "../components/TaskModal";
import { logout } from "../services/authService";
import { useNavigate } from "react-router-dom";

export default function TaskList() {
  const [tasks, setTasks] = useState({
    actividades: [],
    enProceso: [],
    realizadas: [],
    cancelado: [],
  });
  const navigate = useNavigate();
  const [notif, setNotif] = useState({ message: "", type: "" });
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Campos de la tarea
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("media");
  const [userId, setUserId] = useState(null);
  const [tags, setTags] = useState([]);
  const [color, setColor] = useState("#60a5fa");

  const showNotif = (message, type = "info") => {
    setNotif({ message, type });
    setTimeout(() => setNotif({ message: "", type: "" }), 3000);
  };

  const fetchTasks = async () => {
    try {
      const data = await getTasks();
      const grouped = {
        actividades: [],
        enProceso: [],
        realizadas: [],
        cancelado: [],
      };
      data.forEach((task) => {
        grouped[task.status]?.push(task);
      });
      setTasks(grouped);
    } catch {
      showNotif("Error al obtener tareas", "error");
    }
  };

  const handleSaveTask = async () => {
    if (!title.trim()) return;

    const taskData = {
      title,
      description,
      priority,
      user_id: userId,
      tags,
      color,
      status: "actividades",
    };

    try {
      if (editingId) {
        await updateTask(editingId, taskData);
        showNotif("Tarea actualizada", "success");
      } else {
        await createTask(taskData);
        showNotif("Tarea creada", "success");
      }
      fetchTasks();
      closeModal();
    } catch {
      showNotif("Error al guardar tarea", "error");
    }
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete.id);
      showNotif("Tarea eliminada", "success");
      fetchTasks();
    } catch {
      showNotif("Error al eliminar tarea", "error");
    } finally {
      setTaskToDelete(null);
    }
  };

  const handleDragStart = (e, task, originStatus) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ ...task, originStatus })
    );
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const { id, originStatus } = data;
    if (originStatus === newStatus) return;

    try {
      await updateTask(id, { status: newStatus });
      await fetchTasks();
      showNotif("Tarea movida", "info");
    } catch {
      showNotif("Error al mover tarea", "error");
    }
  };

  const allowDrop = (e) => e.preventDefault();

  const closeModal = () => {
    setIsModalOpen(false);
    setTitle("");
    setDescription("");
    setPriority("media");
    setUserId(null);
    setTags([]);
    setColor("#60a5fa");
    setEditingId(null);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openCreateModal = () => {
    closeModal(); // limpia todo antes de abrir
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setTitle(task.title || "");
    setDescription(task.description || "");
    setPriority(task.priority || "media");
    setUserId(task.user_id || null);
    setTags(task.tags || []);
    setColor(task.color || "#60a5fa");
    setEditingId(task.id);
    setIsModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login"); // 👈 Redirige al login
    } catch (err) {
      showNotif("Error al cerrar sesión", "error");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#111827] text-gray-200 p-4 font-mono">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-100 mb-8 tracking-wide">
          🛠️ Gestor de Tareas Dev
        </h2>

        <div className="mb-8 flex justify-end">
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
          >
            Cerrar sesión
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200"
          >
            <PlusCircle size={18} />
            Crear tarea
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {["actividades", "enProceso", "realizadas", "cancelado"].map(
            (status) => (
              <div
                key={status}
                onDrop={(e) => handleDrop(e, status)}
                onDragOver={allowDrop}
                className="bg-[#1e293b] rounded-xl p-4 border border-indigo-800/40 min-h-[300px]"
              >
                <h3 className="text-lg font-semibold capitalize text-center mb-4 text-indigo-400 tracking-wide">
                  {status.replace("_", " ")}
                </h3>
                <ul className="space-y-3">
                  {tasks[status].map((task) => (
                    <li
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task, status)}
                      className="bg-[#334155] border border-slate-700 rounded-lg px-3 py-2 shadow hover:bg-[#475569] transition cursor-grab flex justify-between items-center"
                    >
                      <span>{task.title}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(task)}
                          className="text-emerald-400 hover:text-emerald-300 transition"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setTaskToDelete(task)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      </div>

      {/* Notificación */}
      <Notification
        message={notif.message}
        type={notif.type}
        onClose={() => setNotif({ message: "", type: "" })}
      />

      <TaskModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSaveTask}
        editing={!!editingId}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        priority={priority}
        setPriority={setPriority}
        userId={userId}
        setUserId={setUserId}
        tags={tags}
        setTags={setTags}
        color={color}
        setColor={setColor}
      />

      {/* Modal de confirmación */}
      <AnimatePresence>
        {taskToDelete && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#1e1e2e] border border-gray-700 rounded-xl shadow-xl p-6 w-80 text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-center mb-4 text-yellow-400">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-100">
                ¿Eliminar tarea?
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setTaskToDelete(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
