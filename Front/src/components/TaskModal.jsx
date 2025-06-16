import { useState } from "react";
import { X } from "lucide-react";

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  editing,
  title,
  setTitle,
  description,
  setDescription,
  userId,
  setUserId,
  priority,
  setPriority,
  tags,
  setTags,
  color,
  setColor,
}) {
  const [tab, setTab] = useState("detalles");

  const toggleTag = (tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = () => {
    onSubmit(); // usa los valores que ya están en el padre
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 text-white rounded-xl p-6 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-semibold mb-4">
          {editing ? "Editar Tarea" : "Nueva Tarea"}
        </h3>

        <div className="mb-4 flex border-b border-gray-700">
          <button
            className={`px-4 py-2 ${
              tab === "detalles"
                ? "border-b-2 border-blue-500 text-blue-400"
                : ""
            }`}
            onClick={() => setTab("detalles")}
          >
            Detalles
          </button>
          <button
            className={`px-4 py-2 ${
              tab === "adjuntos"
                ? "border-b-2 border-blue-500 text-blue-400"
                : ""
            }`}
            onClick={() => setTab("adjuntos")}
          >
            Adjuntos
          </button>
        </div>

        {tab === "detalles" && (
          <>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 mb-4 rounded-md bg-gray-800 border border-gray-600 focus:ring-blue-500"
              placeholder="Título..."
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 mb-4 rounded-md bg-gray-800 border border-gray-600 focus:ring-blue-500"
              placeholder="Descripción..."
              rows={3}
            />

            <input
              type="number"
              value={userId || ""}
              onChange={(e) => setUserId(Number(e.target.value))}
              className="w-full p-3 mb-4 rounded-md bg-gray-800 border border-gray-600 focus:ring-blue-500"
              placeholder="ID de Usuario..."
            />

            <div className="mb-4">
              <label className="block mb-2 text-sm text-gray-400">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm text-gray-400">
                Etiquetas
              </label>
              <div className="flex flex-wrap gap-2">
                {["frontend", "backend", "urgente", "idea"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-1 rounded-full text-sm border ${
                      tags.includes(tag)
                        ? "bg-blue-600 border-blue-400 text-white"
                        : "border-gray-500 text-gray-400"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm text-gray-400">Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 p-1 rounded bg-gray-800 border border-gray-600"
              />
            </div>
          </>
        )}

        {tab === "adjuntos" && (
          <div className="text-gray-400">
            Aquí puedes arrastrar archivos o agregar enlaces (mockeado 🔧)
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
