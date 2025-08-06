import { useState } from "react";
import Users from "./Users";
import Roles from "./Roles";
import Tags from "./Tags";

function AdminDashboard() {
  const [section, setSection] = useState("usuarios");

  return (
    <div className="p-6 overflow-y-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-indigo-400">⚙️ Panel de Administración</h1>

      <div className="flex gap-3">
        <button
          onClick={() => setSection("usuarios")}
          className={`px-4 py-2 rounded-md ${
            section === "usuarios" ? "bg-indigo-700 text-white" : "bg-gray-800 text-gray-300"
          }`}
        >
          Usuarios
        </button>
        <button
          onClick={() => setSection("roles")}
          className={`px-4 py-2 rounded-md ${
            section === "roles" ? "bg-indigo-700 text-white" : "bg-gray-800 text-gray-300"
          }`}
        >
          Roles
        </button>
        <button
          onClick={() => setSection("tags")}
          className={`px-4 py-2 rounded-md ${
            section === "tags" ? "bg-indigo-700 text-white" : "bg-gray-800 text-gray-300"
          }`}
        >
          Tags
        </button>
      </div>

      <div className="bg-[#1e293b] p-4 rounded-md border border-indigo-700">
        {section === "usuarios" && <Users />}
        {section === "roles" && <Roles />}
        {section === "tags" && <Tags />}
      </div>
    </div>
  );
}

export default AdminDashboard;
