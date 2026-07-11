const API_BASE_URL =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "";

export async function fetchProducts() {
  const response = await fetch(`${API_BASE_URL}/api/products`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
}

export async function fetchProductById(id) {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  return response.json();
}
