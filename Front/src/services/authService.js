// src/services/authService.js
export const login = async ({ username, password }) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL_AUTH}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) throw new Error(data.error || "Error al iniciar sesión.");
  return data.user;
}; 

export const logout = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL_AUTH}/auth/logout`, {
    method: "POST",
    credentials: "include", // Importante para borrar la cookie de sesión
  }); 
  if (!res.ok) throw new Error("Error al cerrar sesión");
};

 
export const getCurrentUser = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL_AUTH}/auth/me`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("No autenticado");

  return await res.json(); // { user: ... }
};
