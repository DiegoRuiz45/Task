import React, { useEffect, useState } from "react";
import {
  getRoles,
  createRole,
  deleteRole,
  updateRole,
} from "../../services/roleService";
import { CheckCircle, XCircle, Trash2, Pencil } from "lucide-react";

function Roles() {
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      console.error("❌ Error al cargar roles:", err);
      setFeedback({ type: "error", message: "Error al cargar roles" });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: null, message: "" });

    if (!form.name.trim()) {
      return setFeedback({
        type: "error",
        message: "El nombre es obligatorio",
      });
    }

    try {
      if (editingId) {
        await updateRole(editingId, form);
        setFeedback({ type: "success", message: "Rol actualizado" });
      } else {
        await createRole(form);
        setFeedback({ type: "success", message: "Rol creado exitosamente" });
      }
      setForm({ name: "", description: "" });
      setEditingId(null);
      loadRoles();
    } catch (err) {
      const msg = err?.response?.data?.error || "Error al guardar rol";
      setFeedback({ type: "error", message: msg });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este rol?")) return;
    try {
      await deleteRole(id);
      setFeedback({ type: "success", message: "Rol eliminado" });
      loadRoles();
    } catch (err) {
      console.error("❌", err);
      setFeedback({ type: "error", message: "No se pudo eliminar el rol" });
    }
  };

  const handleEdit = (role) => {
    setForm({ name: role.name, description: role.description || "" });
    setEditingId(role.id);
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-2">🛡️ Gestión de Roles</h2>
      <p className="text-sm text-gray-300 mb-4">
        Crea, edita o elimina los roles del sistema.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-[#1e293b] p-4 rounded-md border border-indigo-700 mb-6"
      >
        <div>
          <label className="block text-sm mb-1">Nombre del rol</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Descripción</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 resize-none"
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
          >
            {editingId ? "Actualizar Rol" : "Crear Rol"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setForm({ name: "", description: "" });
                setEditingId(null);
              }}
              className="text-sm text-gray-300 hover:underline"
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {feedback.message && (
        <div
          className={`mb-4 flex items-center gap-2 px-3 py-2 rounded-md ${
            feedback.type === "success"
              ? "bg-green-800 text-green-200"
              : "bg-red-800 text-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <XCircle size={20} />
          )}
          <span className="text-sm">{feedback.message}</span>
        </div>
      )}

      <div>
        <h3 className="text-md font-bold mb-2">🗂 Roles existentes</h3>
        {roles.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay roles registrados.</p>
        ) : (
          <ul className="space-y-2">
            {roles.map((role) => (
              <li
                key={role.id}
                className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-md"
              >
                <div>
                  <p className="text-white font-medium">{role.name}</p>
                  {role.description && (
                    <p className="text-xs text-gray-400">{role.description}</p>
                  )}
                </div>
                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => handleEdit(role)}
                    className="text-blue-400 hover:text-blue-600"
                    title="Editar rol"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="text-red-400 hover:text-red-600"
                    title="Eliminar rol"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Roles;
