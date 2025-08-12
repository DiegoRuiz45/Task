import React, { useEffect, useState } from "react";
import { Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { createUser, getUsers, deleteUser, updateUser } from "../../services/authService";
import { getRoles } from "../../services/roleService";
import Table from "../Table/Table";
import Modal from "../Modal/Modal";

function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState("create"); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ username: "", password: "", role: "" });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const [u, r] = await Promise.all([getUsers(), getRoles()]);
      setUsers(Array.isArray(u) ? u : []);
      setRoles(Array.isArray(r) ? r : []);
    } catch (err) {
      console.error("❌ Error cargando usuarios/roles:", err);
      setFeedback({ type: "error", message: "No se pudieron cargar usuarios/roles" });
    }
  };

  // Columnas para Table
  const columns = [
    { key: "id", header: "ID", className: "text-gray-300" },
    { key: "username", header: "Usuario", className: "text-white" },
    {
      key: "role",
      header: "Rol",
      cell: (v) => v || "—",
    },
  ];

  // Acciones por fila
  const actions = (row) => (
    <>
      <button
        onClick={() => {
          setMode("edit");
          setEditingId(row.id);
          setForm({ username: row.username || "", password: "", role: row.role || "" });
          setOpenModal(true);
        }}
        className="text-blue-400 hover:text-blue-600"
        title="Editar usuario"
      >
        <Pencil size={18} />
      </button>
      <button
        onClick={async () => {
          if (!confirm("¿Eliminar este usuario?")) return;
          try {
            await deleteUser(row.id);
            setFeedback({ type: "success", message: "Usuario eliminado." });
            load();
          } catch (err) {
            console.error("❌", err);
            setFeedback({ type: "error", message: "No se pudo eliminar el usuario." });
          }
        }}
        className="text-red-400 hover:text-red-600"
        title="Eliminar usuario"
      >
        <Trash2 size={18} />
      </button>
    </>
  );

  const onCreate = () => {
    setMode("create");
    setEditingId(null);
    setForm({ username: "", password: "", role: "" });
    setOpenModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setFeedback({ type: null, message: "" });

    if (!form.username.trim()) {
      return setFeedback({ type: "error", message: "El usuario es obligatorio." });
    }
    if (!form.role) {
      return setFeedback({ type: "error", message: "Selecciona un rol válido." });
    }
    if (mode === "create" && !form.password.trim()) {
      return setFeedback({ type: "error", message: "La contraseña es obligatoria." });
    }

    try {
      if (mode === "edit" && editingId) {
        // Si no se escribió password, no la mandes (para no sobreescribir con vacío).
        const payload = { username: form.username, role: form.role };
        if (form.password?.trim()) payload.password = form.password.trim();

        await updateUser(editingId, payload);
        setFeedback({ type: "success", message: "Usuario actualizado." });
      } else {
        await createUser(form);
        setFeedback({ type: "success", message: "Usuario creado correctamente." });
      }
      setOpenModal(false);
      load();
    } catch (err) {
      const msg = err?.response?.data?.error || "Error al procesar usuario";
      setFeedback({ type: "error", message: msg });
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      {feedback.message && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-md px-3 py-2 ${
            feedback.type === "success" ? "bg-green-800 text-green-200" : "bg-red-800 text-red-200"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span className="text-sm">{feedback.message}</span>
        </div>
      )}

      <Table
        title="👥 Gestión de Usuarios"
        data={users}
        columns={columns}
        search={search}
        onSearchChange={setSearch}
        searchBy={["username", "role"]}
        onCreate={onCreate}
        createLabel="Nuevo"
        actions={actions}
        emptyText="No hay usuarios registrados."
        noResultsText="Sin resultados para el filtro."
      />

      <Modal
        open={openModal}
        title={mode === "edit" ? "Editar Usuario" : "Crear Usuario"}
        onClose={() => setOpenModal(false)}
      >
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-200">Usuario</label>
            <input
              name="username"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              required
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring focus:ring-indigo-500"
              placeholder="Ej: juan.perez"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-200">
              Contraseña {mode === "edit" && <span className="text-gray-400">(opcional)</span>}
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring focus:ring-indigo-500"
              placeholder={mode === "edit" ? "Deja en blanco para no cambiarla" : "********"}
              required={mode === "create"}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-200">Rol</label>
            <select
              name="role"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              required
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring focus:ring-indigo-500"
            >
              <option value="" disabled>— Selecciona un rol —</option>
              {roles.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpenModal(false)}
              className="rounded-md px-4 py-2 text-sm text-gray-300 hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
            >
              {mode === "edit" ? "Guardar cambios" : "Crear Usuario"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Users;
