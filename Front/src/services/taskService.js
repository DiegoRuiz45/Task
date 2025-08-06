import axios from "axios";
import { API_URL } from "../config/api";

// ✅ Obtener tareas (protegido con token)
export const getTasks = async () => {
  const res = await axios.get(`${API_URL}/tasks`, {
    withCredentials: true,
  });
  return res.data;
};

// ✅ Crear tarea (protegido)
export const createTask = async (taskData) => {
  const res = await axios.post(`${API_URL}/tasks`, taskData, {
    withCredentials: true,
  });
  return res.data;
};

// ✅ Actualizar tarea (protegido)
export const updateTask = async (id, data) => {
  const res = await axios.put(`${API_URL}/tasks/${id}`, data, {
    withCredentials: true,
  });
  return res.data;
};

// ✅ Eliminar tarea (protegido)
export const deleteTask = async (id) => {
  const res = await axios.delete(`${API_URL}/tasks/${id}`, {
    withCredentials: true,
  });
  return res.data;
};
