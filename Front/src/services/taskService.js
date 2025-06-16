import axios from "axios";
import { API_URL } from "../config/api";

export const getTasks = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createTask = async (taskData) => {
  const res = await axios.post(API_URL, taskData);
  // console.log("Task created:", res.data);
  return res.data;
};

export const updateTask = async (id, data) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};

export const deleteTask = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
