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

export const getUsers = async () => {
  const res = await fetch(`${import.meta.env.VITE_API_URL_AUTH}/auth/getUsers`, {
    credentials: "include",
  })
  if (!res.ok) throw new Error("No autenticado");

  return await res.json(); // { user: ... }
}

export const createUser = async (userData) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL_AUTH}/auth/create-user`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!res.ok) throw new Error("Error al crear usuario");

  return await res.json(); // { user: ... }
}

// 🛠 Actualizar usuario
export const updateUser = async (id, userData) => {
  // Clona el objeto y filtra campos vacíos
  const cleanData = { ...userData };
  if (!cleanData.password?.trim()) {
    delete cleanData.password;
  }

  const res = await fetch(`${import.meta.env.VITE_API_URL_AUTH}/auth/users/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleanData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData?.error || "Error al actualizar usuario");
  }

  return await res.json(); // { message }
};

// 🗑 Eliminar usuario
export const deleteUser = async (id) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL_AUTH}/auth/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData?.error || "Error al eliminar usuario");
  }

  return await res.json(); // { message }
};
