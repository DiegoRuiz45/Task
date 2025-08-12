import React, { useEffect, useState } from "react";
import { Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import {
  getRoles,
  createRole,
  deleteRole,
  updateRole,
} from "../../services/roleService";
import Table from "../Table/Table";
import Modal from "../Modal/Modal";

function Roles() {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState("create"); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const load = async () => {
    try {
      const data = await getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error al cargar roles:", err);
      setFeedback({ type: "error", message: "Error al cargar roles" });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { key: "id", header: "ID", className: "text-gray-300" },
    { key: "name", header: "Nombre", className: "text-white" },
    {
      key: "description",
      header: "Descripción",
      cell: (v) => v || "—",
    },
  ];

  const actions = (row) => (
    <>
      <button
        onClick={() => {
          setMode("edit");
          setEditingId(row.id);
          setForm({ name: row.name || "", description: row.description || "" });
          setOpenModal(true);
        }}
        className="text-blue-400 hover:text-blue-600"
        title="Editar rol"
      >
        <Pencil size={18} />
      </button>
      <button
        onClick={async () => {
          if (!confirm("¿Eliminar este rol?")) return;
          try {
            await deleteRole(row.id);
            setFeedback({ type: "success", message: "Rol eliminado" });
            load();
          } catch (err) {
            console.error("❌", err);
            setFeedback({
              type: "error",
              message: "No se pudo eliminar el rol",
            });
          }
        }}
        className="text-red-400 hover:text-red-600"
        title="Eliminar rol"
      >
        <Trash2 size={18} />
      </button>
    </>
  );

  const onCreate = () => {
    setMode("create");
    setEditingId(null);
    setForm({ name: "", description: "" });
    setOpenModal(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setFeedback({ type: null, message: "" });

    if (!form.name.trim()) {
      return setFeedback({
        type: "error",
        message: "El nombre es obligatorio",
      });
    }

    try {
      if (mode === "edit" && editingId) {
        await updateRole(editingId, form);
        setFeedback({ type: "success", message: "Rol actualizado" });
      } else {
        await createRole(form);
        setFeedback({ type: "success", message: "Rol creado exitosamente" });
      }
      setOpenModal(false);
      load();
    } catch (err) {
      const msg = err?.response?.data?.error || "Error al guardar rol";
      setFeedback({ type: "error", message: msg });
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      {feedback.message && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-md px-3 py-2 ${
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

      <Table
        title="🛡️ Gestión de Roles"
        data={roles}
        columns={columns}
        search={search}
        onSearchChange={setSearch}
        searchBy={["name", "description"]}
        onCreate={onCreate}
        createLabel="Nuevo"
        actions={actions}
        emptyText="No hay roles registrados."
        noResultsText="Sin resultados para el filtro."
      />

      <Modal
        open={openModal}
        title={mode === "edit" ? "Editar Rol" : "Crear Rol"}
        onClose={() => setOpenModal(false)}
      >
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-200">
              Nombre del rol
            </label>
            <input
              name="name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-200">
              Descripción
            </label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              className="w-full resize-none rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring focus:ring-indigo-500"
            />
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
              {mode === "edit" ? "Guardar cambios" : "Crear Rol"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Roles;
