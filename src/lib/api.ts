import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("forma.session");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 401 &&
      sessionStorage.getItem("forma.session")
    )
      window.dispatchEvent(new CustomEvent("forma:session-expired"));
    return Promise.reject(error);
  },
);
export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error))
    return (
      error.response?.data?.message ??
      (error.code === "ECONNABORTED"
        ? "A requisição demorou demais. Tente novamente."
        : "Não foi possível conectar. Tente novamente.")
    );
  return "Ocorreu um erro inesperado.";
}
