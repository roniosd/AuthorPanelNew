import axios from "axios";

export const TOKEN_KEY = "writer_token";
// Admin "View panel" from the POS: a short read-only token kept for this browser tab only.
export const VIEW_KEY = "writer_view_token";
export const isViewOnly = () => Boolean(sessionStorage.getItem(VIEW_KEY));
export const tokenOf = () => sessionStorage.getItem(VIEW_KEY) || localStorage.getItem(TOKEN_KEY);
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
export const IMAGE_BASE = (import.meta.env.VITE_IMAGE_BASE_URL || API_BASE).replace(/\/+$/, "");
// Author photos live on the website (e-commerce) profile.
export const SITE_IMAGE_BASE = (import.meta.env.VITE_SITE_IMAGE_BASE_URL || IMAGE_BASE).replace(/\/+$/, "");

export const api = axios.create({ baseURL: `${API_BASE}/api/v1`, timeout: 20000 });

api.interceptors.request.use((config) => {
  if (isViewOnly() && (config.method || "get").toLowerCase() !== "get") return Promise.reject(new Error("View only — changes are turned off."));
  const token = tokenOf();
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
    // Only a rejected POS token ends the session; the profile proxy reports website errors as 5xx/409.
    const url = error.config?.url || "";
    if (error.response?.status === 401 && tokenOf() && !url.includes("/author/self-profile")) {
      if (isViewOnly()) sessionStorage.removeItem(VIEW_KEY);
      else localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("author:logout"));
    }
    return Promise.reject(error);
  },
);

export const errorText = (error) => error?.response?.data?.message || error?.message || "Something went wrong.";
export const get = async (url, params) => (await api.get(url, { params })).data.data;
export const send = async (method, url, body) => (await api.request({ method, url, data: body })).data;

// Same paths as the POS imageUrl() helper (spaces become dashes).
export const bookCover = (cover) => (cover ? `${IMAGE_BASE}/book/${String(cover).replace(/\s+/g, "-")}` : null);
export const authorPhoto = (photo) => (photo ? `${SITE_IMAGE_BASE}/author/${String(photo).replace(/\s+/g, "-")}` : null);

// Fetches every page of a list endpoint (max 100 per page) — used by Excel exports.
export const getAll = async (url, params = {}) => {
  const rows = [];
  for (let page = 1; page < 50; page += 1) {
    const data = await get(url, { ...params, page, limit: 100 });
    rows.push(...(data.rows || []));
    if (rows.length >= (data.total || 0) || !data.rows?.length) break;
  }
  return rows;
};

// Downloads rows as a CSV file that Excel opens (UTF-8 with BOM so Bangla shows correctly).
export const downloadCsv = (name, headers, rows) => {
  const cell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.map(([, label]) => cell(label)).join(","), ...rows.map((row) => headers.map(([key]) => cell(typeof key === "function" ? key(row) : row[key])).join(","))].join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" }));
  link.download = `${name}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};
