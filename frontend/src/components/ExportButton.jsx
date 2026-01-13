// ++ file: src/components/ExportButton.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ExportButton({ type = 'event', id }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const url = `http://localhost:5000/export/${type}/${id}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CSV');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = type === 'event' 
        ? `attendance-event-${id}.csv`
        : `attendance-group-${id}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      alert(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      className="btn btn-outline"
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? 'Exporting...' : `Export ${type === 'event' ? 'Event' : 'Group'} CSV`}
    </button>
  );
}
