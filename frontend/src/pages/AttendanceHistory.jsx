import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "../styles/AttendanceHistory.css";
import API_URL from "../config";

export default function AttendanceHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user, isProfessor } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !user.id) {
          setLoading(false);
          return;
        }

        const url = isProfessor()
          ? `https://${API_URL}/attendance/professor-history`
          : `https://${API_URL}/event-join/my-attendance/${user.id}`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Fetch failed");

        const data = await response.json();
        setHistory(data || []);
      } catch (error) {
        console.error("Error fetching history:", error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, isProfessor]);

  if (loading) return <div className="loading-state">Loading history...</div>;

  if (isProfessor()) {
    return (
      <div className="attendance-container">
        <div className="history-header">
          <h3 className="history-title">Event Attendance Reports</h3>
          <p className="history-subtitle">Overview of participants per event</p>
        </div>

        <div className="history-list">
          {history.length > 0 ? (
            history.map((event) => (
              <div key={event.id} className="history-card professor-card">
                <div className="history-card-header">
                  <div>
                    <h4>{event.name}</h4>
                    <span className="event-date">
                      {new Date(event.startTime).toLocaleDateString()} •{" "}
                      {new Date(event.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="stats-pill">
                    👥 {event.Attendances ? event.Attendances.length : 0}{" "}
                    Participants
                  </div>
                </div>

                <div className="participants-section">
                  {event.Attendances && event.Attendances.length > 0 ? (
                    <table className="participants-table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Time Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {event.Attendances.map((att) => (
                          <tr key={att.id}>
                            <td className="fw-bold">
                              {att.Participant?.name || "Unknown"}
                            </td>
                            <td className="text-muted">
                              {att.Participant?.email}
                            </td>
                            <td>
                              <span
                                className={`status-badge status-${
                                  att.status?.toLowerCase() || "present"
                                }`}
                              >
                                {att.status}
                              </span>
                            </td>
                            <td className="time-cell">
                              {att.confirmedAt
                                ? new Date(att.confirmedAt).toLocaleTimeString()
                                : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-participants">No participants yet.</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">No events found.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-container">
      <div className="history-header">
        <h3 className="history-title">My Attendance History</h3>
        <p className="history-subtitle">Events you have joined</p>
      </div>

      <div className="history-table-container">
        {history.length > 0 ? (
          <div className="history-grid">
            {history.map((record) => (
              <div key={record.id} className="history-card">
                <div className="history-card-header">
                  <h4>{record.Event?.name || "Event"}</h4>
                  <span
                    className={`status-badge status-${
                      record.status?.toLowerCase() || "present"
                    }`}
                  >
                    {record.status || "PRESENT"}
                  </span>
                </div>
                <div className="history-details">
                  <div className="detail-row">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">
                      {record.Event?.startTime
                        ? new Date(record.Event.startTime).toLocaleDateString()
                        : "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Joined At:</span>
                    <span className="detail-value">
                      {record.confirmedAt
                        ? new Date(record.confirmedAt).toLocaleString()
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            This page is only visible to the professor.
          </div>
        )}
      </div>
    </div>
  );
}
