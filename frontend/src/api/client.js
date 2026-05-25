import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("alkebulanx_token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      logout();

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export function saveAuth(token, user) {
  if (token) {
    localStorage.setItem("alkebulanx_token", token);
  }

  if (user) {
    localStorage.setItem("alkebulanx_user", JSON.stringify(user));
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("alkebulanx_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    logout();
    return null;
  }
}

export function getStoredToken() {
  return localStorage.getItem("alkebulanx_token");
}

export function logout() {
  localStorage.removeItem("alkebulanx_token");
  localStorage.removeItem("alkebulanx_user");
}

export function isPremiumUser() {
  const user = getStoredUser();
  return user?.role === "premium" || user?.is_premium === true;
}