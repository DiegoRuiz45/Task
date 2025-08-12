import React, { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Table from "../Table/Table";
import Modal from "../Modal/Modal";
import {
  getTag,
  createTag,
  updateTag,
  deleteTag,
} from "../../services/tagServices";

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const load = async () => {
    const data = await getTag();
    setTags(Array.isArray(data) ? data : []);
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
        title="Editar"
      >
        <Pencil size={18} />
      </button>
      <button
        onClick={async () => {
          if (!confirm("¿Eliminar este tag?")) return;
          await deleteTag(row.id);
          load();
        }}
        className="text-red-400 hover:text-red-600"
        title="Eliminar"
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
    if (mode === "edit" && editingId) {
      await updateTag(editingId, form);
    } else {
      await createTag(form);
    }
    setOpenModal(false);
    load();
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Table
        title="🏷️ Gestión de Tags"
        data={tags}
        columns={columns}
        search={search}
        onSearchChange={setSearch}
        searchBy={["name", "description"]}
        onCreate={onCreate}
        createLabel="Nuevo"
        actions={actions}
        emptyText="No hay tags registrados."
        noResultsText="Sin resultados para el filtro."
      />

      <Modal
        open={openModal}
        title={mode === "edit" ? "Editar Tag" : "Crear Tag"}
        onClose={() => setOpenModal(false)}
      >
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-200">Nombre</label>
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
              {mode === "edit" ? "Guardar cambios" : "Crear Tag"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
