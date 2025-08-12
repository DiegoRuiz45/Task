import React, { useState, useEffect } from "react";
import { createUser, getUsers, deleteUser, updateUser } from "../../services/authService";
import { getRoles } from "../../services/roleService";
import { CheckCircle, XCircle, Pencil, Trash2 } from "lucide-react";

function Users() {
  const [form, setForm] = useState({ id: null, username: "", password: "", role: "" });
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (err) {
      console.error("❌ Error al cargar roles:", err);
      setRoles([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers(); // ✅ Import corregido
      setUsers(data);
    } catch (err) {
      console.error("❌ Error al cargar usuarios:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: null, message: "" });

    if (!form.role) {
      return setFeedback({ type: "error", message: "Selecciona un rol válido." });
    }

    try {
      if (form.id) {
        console.log("Actualizando usuario:", form);
        await updateUser(form.id, form);
        setFeedback({ type: "success", message: "Usuario actualizado." });
      } else {
        await createUser(form);
        setFeedback({ type: "success", message: "Usuario creado correctamente." });
      }
      setForm({ id: null, username: "", password: "", role: "" });
      fetchUsers();
    } catch (err) {
      const msg = err?.response?.data?.error || "Error al procesar usuario";
      setFeedback({ type: "error", message: msg });
    }
  };

  const handleEdit = (user) => {
    setForm({ id: user.id, username: user.username, password: "", role: user.role });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await deleteUser(id);
      setFeedback({ type: "success", message: "Usuario eliminado." });
      fetchUsers();
    } catch (err) {
      setFeedback({ type: "error", message: "No se pudo eliminar el usuario." });
    }
  };
  const [preview, setPreview] = useState(null);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, profileImage: file });

    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[#1e293b] text-gray-200 rounded-lg border border-indigo-700">
      <h2 className="text-2xl font-bold mb-2">👥 Gestión de Usuarios</h2>
      <p className="text-sm text-gray-400 mb-4">
        Crea, edita y elimina usuarios del sistema.
      </p>

      {/* <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm mb-1 font-medium">Usuario</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-md"
            placeholder="Ej: juan.perez"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">Contraseña</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-md"
            placeholder={form.id ? "Deja en blanco para no cambiarla" : "********"}
            required={!form.id}
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">Rol</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-md"
          >
            <option value="" disabled>
              — Selecciona un rol —
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-2 rounded-md"
        >
          {form.id ? "Actualizar Usuario" : "Crear Usuario"}
        </button>
      </form> */
        <form
          onSubmit={handleSubmit}
          className="space-y-4 mb-6"
          encType="multipart/form-data"
        >
          {/* Usuario */}
          <div>
            <label className="block text-sm mb-1 font-medium">Usuario</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-md"
              placeholder="Ej: juan.perez"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm mb-1 font-medium">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-md"
              placeholder={form.id ? "Deja en blanco para no cambiarla" : "********"}
              required={!form.id}
            />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm mb-1 font-medium">Rol</label>
            <select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-md"
          >
            <option value="" disabled>
              — Selecciona un rol —
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
          </div>

          {/* Imagen con preview */}
          <div>
            <label className="block text-sm mb-1 font-medium">Foto de perfil</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                name="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
              />
              {preview && (
                <div className="w-24 h-24 border-2 border-gray-600 rounded-md overflow-hidden shadow-md">
                  <img
                    src={preview}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-2 rounded-md"
          >
            {form.id ? "Actualizar Usuario" : "Crear Usuario"}
          </button>
        </form>

      
      }

      {feedback.message && (
        <div
          className={`mb-4 flex items-center gap-2 px-4 py-3 rounded-md text-sm ${
            feedback.type === "success"
              ? "bg-green-800 text-green-200"
              : "bg-red-800 text-red-200"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <h3 className="text-lg font-semibold mb-2">📋 Usuarios registrados</h3>
      <ul className="space-y-2">
        {users.map((user) => (
          <li
            key={user.id}
            className="bg-gray-800 p-3 rounded-md flex items-center justify-between"
          >
            <div>
              <p className="text-white font-medium">{user.username}</p>
              <p className="text-xs text-gray-400">Rol: {user.role}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(user)}
                className="text-yellow-400 hover:text-yellow-600"
                title="Editar"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(user.id)}
                className="text-red-400 hover:text-red-600"
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
