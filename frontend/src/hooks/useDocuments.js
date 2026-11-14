import { useCallback, useEffect, useRef, useState } from "react";
import {
  listDocuments,
  uploadDocument,
  deleteDocument,
} from "../services/documentApi";

const MAX_MB = 10; // keep in step with MAX_UPLOAD_MB on the server

export default function useDocuments(enabled = true) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  // { type: "success" | "error", text } | null
  const [status, setStatus] = useState(null);
  const timer = useRef(null);

  const flash = useCallback((next) => {
    clearTimeout(timer.current);
    setStatus(next);
    if (next) timer.current = setTimeout(() => setStatus(null), 6000);
  }, []);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      setDocuments(await listDocuments());
    } catch (error) {
      console.error(error);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
    return () => clearTimeout(timer.current);
  }, [refresh]);

  const upload = async (file) => {
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      flash({ type: "error", text: "Only PDF files are supported." });
      return;
    }

    if (file.size > MAX_MB * 1024 * 1024) {
      flash({ type: "error", text: `That file is over ${MAX_MB} MB.` });
      return;
    }

    setUploading(true);
    setStatus(null);

    try {
      const result = await uploadDocument(file);

      flash({
        type: "success",
        text: result.duplicate
          ? `${file.name} is already in your library.`
          : `Added ${file.name} (${result.chunks} sections indexed). Ask me about it.`,
      });

      await refresh();
    } catch (error) {
      flash({ type: "error", text: error.message });
    } finally {
      setUploading(false);
    }
  };

  const remove = async (hash) => {
    try {
      await deleteDocument(hash);
      setDocuments((docs) => docs.filter((d) => d.hash !== hash));
    } catch (error) {
      flash({ type: "error", text: error.message });
    }
  };

  return { documents, uploading, status, upload, remove };
}
