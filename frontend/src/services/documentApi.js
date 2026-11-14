import { API_BASE_URL, authFetch } from "./authApi";

async function parse(response, fallback) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || fallback);
  }

  return data;
}

export const listDocuments = async () => {
  const response = await authFetch(`${API_BASE_URL}/api/documents`);
  const data = await parse(response, "Couldn't load your documents");
  return data.documents;
};

export const uploadDocument = async (file) => {
  const form = new FormData();
  form.append("file", file);

  // No Content-Type header: the browser adds the multipart boundary itself.
  const response = await authFetch(`${API_BASE_URL}/api/documents/upload`, {
    method: "POST",
    body: form,
  });

  return parse(response, "Upload failed");
};

export const deleteDocument = async (hash) => {
  const response = await authFetch(`${API_BASE_URL}/api/documents/${hash}`, {
    method: "DELETE",
  });

  return parse(response, "Couldn't remove the document");
};
