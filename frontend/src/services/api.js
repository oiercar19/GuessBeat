const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const registerUser = async (username, email, password) => {
  const res = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error en el registro");
  }

  return res.json();
};

export const loginUser = async (username, password) => {
  const res = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error en el login");
  }
  
  return res.json();
};

export const getProfile = async () => {
  // Obtener el token del localStorage automáticamente
  const token = localStorage.getItem("token");
  
  if (!token) {
    throw new Error("No hay token de autenticación");
  }
  
  const res = await fetch(`${API_URL}/users/profile`, {
    headers: { 
      Authorization: `Bearer ${token}` 
    },
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al obtener perfil");
  }
  
  return res.json();
};

// --- CHAT GENERAL ---
export const getChatMessages = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/chat`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Error al obtener mensajes del chat");
  return res.json();
};

export const sendChatMessage = async (message) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("Error al enviar mensaje");
  return res.json();
};

export const getRanking = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/users/ranking`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Error al obtener el ranking");
  }
  return res.json();
};