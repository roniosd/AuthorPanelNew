export const imageUrl = (
  path,
  fallback = "/default.jpg",
  folder = "/upload",
) => {
  if (!path) return fallback.trim() ? fallback : "/default.jpg";

  return `${import.meta.env.VITE_IMAGE_BASE_URL}${folder}/${path.replace(/\s+/g, "-")}`;
};
