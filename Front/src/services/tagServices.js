import axios from "axios";
import { API_URL } from "../config/api";

// ✅ Obtener todos los tags
export const getTag = async () => {
    console.log("🧠 Llamando a:", `${API_URL}/tags`);
    const res = await axios.get(`${API_URL}/tags`, { withCredentials: true });
    return res.data;
};

// ✅ Obtener un tag por ID
export const getTagById = async (id) => {
    const res = await axios.get(`${API_URL}/tags/${id}`, {
        withCredentials: true,
    });
    return res.data;
};

// ✅ Crear nuevo tag
export const createTag = async (tagData) => {
    const res = await axios.post(`${API_URL}/tags`, tagData, {
        withCredentials: true,
    });
    return res.data;
};

// ✅ Actualizar tag
export const updateTag = async (id, tagData) => {
    const res = await axios.put(`${API_URL}/tags/${id}`, tagData, {
        withCredentials: true,
    });
    return res.data;
};

// ✅ Eliminar tag
export const deleteTag = async (id) => {
    const res = await axios.delete(`${API_URL}/tags/${id}`, {
        withCredentials: true,
    });
    return res.data;
};
