import axios from "axios";

export const TOKEN_KEY = "writer_token";
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
export const IMAGE_BASE = (import.meta.env.VITE_IMAGE_BASE_URL || API_BASE).replace(/\/+$/, "");

export const api = axios.create({ baseURL: `${API_BASE}/api/v1`, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    // Some POS routes answer 200 with { success: false }.
    if (res.data && res.data.success === false) return Promise.reject(Object.assign(new Error(res.data.message || "Request failed"), { response: res }));
    return res;
  },
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("author:logout"));
    }
    return Promise.reject(error);
  },
);

export const errorText = (error) => error?.response?.data?.message || error?.message || "Something went wrong.";
export const get = async (url, params) => (await api.get(url, { params })).data.data;
export const send = async (method, url, body) => (await api.request({ method, url, data: body })).data;

export const bookCover = (cover) => (cover ? `${IMAGE_BASE}/book/${cover}` : null);
export const authorPhoto = (photo) => (photo ? `${IMAGE_BASE}/author/${photo}` : null);
