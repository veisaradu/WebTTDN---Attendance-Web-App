import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API_URL from "../config";
export default function ExportButton({ type = "event", id }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const url = `https://${API_URL}/export/${type}/${id}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        let errorMessage = "Failed to fetch CSV";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download =
        type === "event"
          ? `attendance-event-${id}.csv`
          : `attendance-group-${id}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Export error:", error);
      alert(`Export Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="btn btn-outline"
      style={{
        padding: "0.5rem 1rem",
        border: "1px solid #ccc",
        borderRadius: "4px",
        background: "white",
        cursor: "pointer",
        marginLeft: "5px",
      }}
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? "Exporting..." : `Export CSV`}
    </button>
  );
}
