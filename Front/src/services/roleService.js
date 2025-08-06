import axios from "axios";
import { API_URL } from "../config/api"; 

// ✅ Obtener todos los roles
export const getRoles = async () => {
    console.log("🧠 Llamando a:", `${API_URL}/roles`);
    const res = await axios.get(`${API_URL}/roles`, { withCredentials: true });
    return res.data;
};

// ✅ Obtener un rol por ID
export const getRoleById = async (id) => {
    const res = await axios.get(`${API_URL}/roles/${id}`, {
        withCredentials: true,
    });
    return res.data;
};

// ✅ Crear nuevo rol
export const createRole = async (roleData) => {
    const res = await axios.post(`${API_URL}/roles`, roleData, {
        withCredentials: true,
    });
    return res.data;
};

// ✅ Actualizar rol
export const updateRole = async (id, roleData) => {
    const res = await axios.put(`${API_URL}/roles/${id}`, roleData, {
        withCredentials: true,
    });
    return res.data;
};

// ✅ Eliminar rol
export const deleteRole = async (id) => {
    const res = await axios.delete(`${API_URL}/roles/${id}`, {
        withCredentials: true,
    });
    return res.data;
};
