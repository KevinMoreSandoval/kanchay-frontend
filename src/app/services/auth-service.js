// src/app/services/authService.js

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

/**
 * Petición HTTP real para registrar un nuevo usuario contra el backend de Spring Boot.
 * @param {Object} userData - Datos del usuario a registrar.
 * @returns {Promise<Object>} Respuesta del servidor.
 */
export async function registerApi(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || "Ocurrió un error al registrar la cuenta.");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "No se pudo conectar con el servidor.");
  }
}

/**
 * Petición HTTP real para iniciar sesión contra el backend de Spring Boot.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, user: Object }>}
 */
export async function loginApi(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.message || "Credenciales incorrectas o error en el servidor.";
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * Persistencia real en localStorage tras un inicio de sesión exitoso.
 */
export function setSession(token, user) {
  if (token) localStorage.setItem("token", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
}

/**
 * Limpieza de sesión al cerrar sesión.
 */
export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/**
 * Obtención del usuario almacenado en sesión local.
 */
export function getStoredUser() {
  const storedUser = localStorage.getItem("user");
  try {
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}