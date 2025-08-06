import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getUsers } from "../services/authService";

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  editing,
  title,
  setTitle,
  description,
  setDescription,
  userIds = [], // fallback defensivo
  setUserIds,
  priority,
  setPriority,
  tags,
  setTags,
  color,
  setColor,
}) {
  const [tab, setTab] = useState("detalles");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        setUsers(res);
      } catch (err) {
        console.error("❌ Error al obtener usuarios:", err);
      }
    };
    fetchUsers();
  }, [isOpen]);

  const toggleTag = (tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      alert("Debes asignar al menos un usuario.");
      return;
    }
    onSubmit();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="p-6 border-b border-white/20 flex justify-between items-center">
          <h3 className="text-2xl font-semibold tracking-wide">
            {editing ? "Editar Tarea" : "Nueva Tarea"}
          </h3>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition"
          >
            <X size={22} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 flex border-b border-white/10 gap-6 text-sm">
          {["detalles", "adjuntos"].map((tabName) => (
            <button
              key={tabName}
              className={`pb-2 transition font-medium ${
                tab === tabName
                  ? "border-b-2 border-blue-400 text-blue-300"
                  : "text-white/60 hover:text-white"
              }`}
              onClick={() => setTab(tabName)}
            >
              {tabName[0].toUpperCase() + tabName.slice(1)}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 py-6 space-y-5 custom-scroll">
          {tab === "detalles" && (
            <>
              {/* Título */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 placeholder-white/40 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Título..."
              />

              {/* Descripción */}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 placeholder-white/40 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Descripción..."
                rows={3}
              />

              {/* Usuarios asignados */}
              <div>
                <label className="block mb-2 text-sm text-white/70">
                  Usuarios asignados
                </label>
                <div className="flex gap-4">
                  {/* Lista de usuarios disponibles */}
                  <div className="w-1/2">
                    <p className="text-sm text-white/60 mb-2">Disponibles</p>
                    <div className="h-40 overflow-y-auto border border-white/20 rounded p-2 bg-white/10">
                      {users
                        .filter(
                          (u) =>
                            Array.isArray(userIds) && !userIds.includes(u.id)
                        )
                        .map((user) => (
                          <div
                            key={user.id}
                            onClick={() =>
                              setUserIds((prev) => [...prev, user.id])
                            }
                            className="p-2 rounded hover:bg-blue-500 cursor-pointer transition"
                          >
                            {user.username} ({user.role})
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Lista de usuarios seleccionados */}
                  <div className="w-1/2">
                    <p className="text-sm text-white/60 mb-2">Seleccionados</p>
                    <div className="h-40 overflow-y-auto border border-white/20 rounded p-2 bg-white/10">
                      {Array.isArray(userIds) && userIds.length === 0 && (
                        <p className="text-white/40 text-sm italic">
                          Ninguno seleccionado
                        </p>
                      )}
                      {users
                        .filter(
                          (u) =>
                            Array.isArray(userIds) && userIds.includes(u.id)
                        )
                        .map((user) => (
                          <div
                            key={user.id}
                            onClick={() =>
                              setUserIds((prev) =>
                                prev.filter((id) => id !== user.id)
                              )
                            }
                            className="p-2 rounded hover:bg-red-500 cursor-pointer transition"
                          >
                            {user.username} ({user.role})
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prioridad */}
              <div>
                <label className="block mb-2 text-sm text-white/70">
                  Prioridad
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-black focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              {/* Etiquetas */}
              <div>
                <label className="block mb-2 text-sm text-white/70">
                  Etiquetas
                </label>
                <div className="flex flex-wrap gap-2">
                  {["frontend", "backend", "urgente", "idea"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm border transition ${
                        tags.includes(tag)
                          ? "bg-blue-600 border-blue-400 text-white"
                          : "border-white/30 text-white/60 hover:text-white"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block mb-2 text-sm text-white/70">
                  Color
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-16 h-10 p-1 rounded border border-white/20 bg-white/10 cursor-pointer"
                />
              </div>
            </>
          )}

          {/* Tab de adjuntos (mock) */}
          {tab === "adjuntos" && (
            <div className="text-white/70 text-sm">
              Aquí puedes arrastrar archivos o agregar enlaces (mockeado 🔧)
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end bg-white/5">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
