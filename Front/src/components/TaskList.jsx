import { useState, useEffect, useCallback } from "react";
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

const statusColors = {
  actividades: "border-blue-500 shadow-blue-500/20",
  enProceso: "border-yellow-500 shadow-yellow-500/20",
  realizadas: "border-green-500 shadow-green-500/20",
  cancelado: "border-red-500 shadow-red-500/20",
};

const priorityBadge = {
  alta: "bg-red-500 text-white",
  media: "bg-yellow-500 text-black",
  baja: "bg-green-500 text-white",
};

export default function TaskList({ user }) {
  const [tasks, setTasks] = useState({
    actividades: [],
    enProceso: [],
    realizadas: [],
    cancelado: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [notif, setNotif] = useState({ message: "", type: "" });
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalTab, setModalTab] = useState("detalles");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("media");
  const [tags, setTags] = useState([]);
  const [color, setColor] = useState("#60a5fa");
  const [subtasks, setSubtasks] = useState([]);
  const [history, setHistory] = useState([]);
  const [userIds, setUserIds] = useState([]);

  const showNotif = (message, type = "info") => {
    setNotif({ message, type });
    setTimeout(() => setNotif({ message: "", type: "" }), 3000);
  };

  const fetchTasks = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSaveTask = async () => {
    if (!title.trim()) return;
    const taskData = {
      title,
      description,
      priority,
      user_ids: userIds,
      tags,
      color,
      subtasks,
      history,
      status: "actividades",
    };

    console.log(taskData);

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
    setTags([]);
    setColor("#60a5fa");
    setSubtasks([]);
    setHistory([]);
    setEditingId(null);
    setModalTab("detalles");
  };

  const openCreateModal = () => {
    closeModal();
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setTitle(task.title || "");
    setDescription(task.description || "");
    setPriority(task.priority || "media");
    setUserIds(task.user_ids || null);
    setTags(Array.isArray(task.tags) ? task.tags : safeParseArray(task.tags));
    setColor(task.color || "#60a5fa");
    setSubtasks(task.subtasks || []);
    setHistory(task.history || []);
    setEditingId(task.id);
    setIsModalOpen(true);
  };

  const filteredTasks = Object.fromEntries(
    Object.entries(tasks).map(([status, items]) => [
      status,
      items.filter((t) =>
        [
          t.title,
          t.description,
          ...(t.tags || []),
          ...(t.user_names || []), // ✅ Agregado: nombres de usuario
        ]
          .filter(Boolean)
          .some((field) =>
            field.toLowerCase().includes(searchTerm.toLowerCase())
          )
      ),
    ])
  );

  return (
    <div className="h-screen bg-[#111827] text-gray-200 font-mono flex flex-col">
      <div className="p-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-100 tracking-wide">
                🛠️ Gestor de Tareas
              </h2>
              <p className="text-indigo-400">Hola, {user?.username} 👋</p>
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar tareas..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md pl-10 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <svg
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35M15.5 10.5A5 5 0 1110.5 5a5 5 0 015 5z"
                  ></path>
                </svg>
              </div>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <PlusCircle size={18} /> Crear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 min-h-0 custom-scroll">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Object.keys(filteredTasks).map((status) => (
              <motion.div
                key={status}
                onDrop={(e) => handleDrop(e, status)}
                onDragOver={allowDrop}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`rounded-xl p-4 min-h-[300px] bg-[#1e293b] border ${statusColors[status]} transition-all`}
              >
                <h3 className="text-lg font-bold capitalize text-center mb-4 text-white tracking-wider">
                  {status.replace("_", " ")}
                </h3>
                <ul className="space-y-3">
                  {filteredTasks[status].map((task) => (
                    <motion.li
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task, status)}
                      className="bg-[#334155] border border-slate-700 rounded-lg p-3 shadow hover:shadow-lg transition cursor-grab flex flex-col gap-2"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-white font-semibold">
                          {task.title}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            priorityBadge[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-sm text-gray-400 truncate">
                          {task.description}
                        </p>
                      )}
                      {task.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs bg-indigo-600 px-2 py-1 rounded-full text-white"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {task.subtasks?.length > 0 && (
                        <ul className="text-sm mt-2">
                          {task.subtasks.map((sub, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={sub.done}
                                readOnly
                              />
                              <span>{sub.text}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {task.history?.length > 0 && (
                        <details className="mt-2 text-sm text-gray-400">
                          <summary className="cursor-pointer">
                            Ver historial
                          </summary>
                          <ul className="ml-4 list-disc">
                            {task.history.map((entry, i) => (
                              <li key={i}>{entry}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                      {/* 👥 Participantes */}
                      {task.user_names?.length > 0 && (
                        <p className="text-xs text-gray-400 italic">
                          👥 {task.user_names.join(", ")}
                        </p>
                      )}
                      <div className="flex justify-end gap-3 mt-2">
                        <button
                          onClick={() => openEditModal(task)}
                          className="text-emerald-400 hover:text-emerald-300 transition"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => setTaskToDelete(task)}
                          className="text-red-400 hover:text-red-300 transition"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

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
        modalTab={modalTab}
        setModalTab={setModalTab}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        priority={priority}
        setPriority={setPriority}
        userIds={userIds}
        setUserIds={setUserIds}
        tags={tags}
        setTags={setTags}
        color={color}
        setColor={setColor}
        subtasks={subtasks}
        setSubtasks={setSubtasks}
        history={history}
        setHistory={setHistory}
      />

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
