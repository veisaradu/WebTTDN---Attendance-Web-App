import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Events.css";
import ExportButton from "../components/ExportButton";
import API_URL from "../config";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [viewingParticipants, setViewingParticipants] = useState(null);
  const [showAddManualModal, setShowAddManualModal] = useState(false);

  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [participantsList, setParticipantsList] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [searchStudent, setSearchStudent] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    maxParticipants: 50,
    description: "",
    eventType: "Workshop",
    status: "CLOSED",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const { token, isProfessor, user } = useAuth();

  useEffect(() => {
    fetchEvents();

    const interval = setInterval(() => {
      fetchEvents(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchEvents = async (isBackground = false) => {
    try {
      const response = await fetch("http://${API_URL}/events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (!isBackground) setEvents([]);
        return;
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : [];
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      if (!isBackground) setEvents([]);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description &&
        event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "ALL" || event.eventType === filterType;
    const matchesStatus =
      filterStatus === "ALL" || event.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const eventTypes = [
    "ALL",
    ...new Set([
      "Workshop",
      "Lecture",
      "Seminar",
      "Meeting",
      "Conference",
      ...events.map((e) => e.eventType).filter(Boolean),
    ]),
  ];
  const eventStatuses = ["ALL", "OPEN", "CLOSED", "FULL"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleJoinEvent = async (e) => {
    e.preventDefault();
    setJoinError("");
    if (!joinCode.trim()) {
      setJoinError("Please enter a code");
      return;
    }

    if (!user || !user.id) {
      setJoinError("You must be logged in to join events");
      return;
    }

    try {
      const response = await fetch("http://${API_URL}/event-join/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          textCode: joinCode.toUpperCase().trim(),
          participantId: user.id,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Successfully joined: ${data.event?.name || "Event"}`);
        setShowJoinModal(false);
        setJoinCode("");
        fetchEvents();
      } else {
        setJoinError(data.error || "Failed to join event");
      }
    } catch (error) {
      setJoinError("Network error.");
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://${API_URL}/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString(),
        }),
      });
      if (response.ok) {
        setShowCreateModal(false);
        resetForm();
        fetchEvents();
        alert("Event created successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      alert("Network error");
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      startTime: event.startTime ? event.startTime.slice(0, 16) : "",
      endTime: event.endTime ? event.endTime.slice(0, 16) : "",
      maxParticipants: event.maxParticipants || 50,
      description: event.description || "",
      eventType: event.eventType || "Workshop",
      status: event.status || "CLOSED",
    });
    setShowCreateModal(true);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://${API_URL}/events/${editingEvent.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            startTime: new Date(formData.startTime).toISOString(),
            endTime: new Date(formData.endTime).toISOString(),
          }),
        }
      );
      if (response.ok) {
        setShowCreateModal(false);
        setEditingEvent(null);
        resetForm();
        fetchEvents();
        alert("Event updated successfully!");
      } else {
        alert("Failed to update event");
      }
    } catch (error) {
      alert("Network error");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (
      window.confirm(
        "Delete this event? This will remove all attendance records."
      )
    ) {
      try {
        const response = await fetch(
          `http://${API_URL}/events/${eventId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          fetchEvents();
        } else {
          alert("Failed to delete event");
        }
      } catch (error) {
        alert("Network error");
      }
    }
  };

  const handleViewParticipants = async (eventId) => {
    setLoadingParticipants(true);
    try {
      const response = await fetch(`http://${API_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setViewingParticipants(data);
      setParticipantsList(data.Attendances || []);
    } catch (error) {
      alert("Could not load participants");
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleStatusChange = async (attendanceId, newStatus) => {
    try {
      const response = await fetch(
        `http://${API_URL}/attendance/${attendanceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (response.ok) {
        setParticipantsList((prevList) =>
          prevList.map((att) =>
            att.id === attendanceId ? { ...att, status: newStatus } : att
          )
        );
      }
    } catch (error) {
      alert("Network error");
    }
  };

  const openAddManualModal = async (eventId) => {
    setSelectedEventId(eventId);
    setShowAddManualModal(true);
    try {
      const response = await fetch("http://${API_URL}/participants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setAllStudents(data.filter((p) => p.role === "STUDENT") || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddStudentToEvent = async (studentId) => {
    try {
      const response = await fetch("http://${API_URL}/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: selectedEventId,
          participantId: studentId,
          status: "PRESENT",
        }),
      });
      if (response.ok) {
        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === selectedEventId
              ? {
                  ...ev,
                  currentParticipants: (ev.currentParticipants || 0) + 1,
                }
              : ev
          )
        );
        alert("Student added!");
      } else {
        const d = await response.json();
        alert(d.error || "Failed to add");
      }
    } catch (error) {
      alert("Network error");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      startTime: "",
      endTime: "",
      maxParticipants: 50,
      description: "",
      eventType: "Workshop",
      status: "CLOSED",
    });
  };

  if (loading) return <div className="loading-spinner">Loading events...</div>;

  return (
    <div className="events-page">
      <div className="events-header">
        <div>
          <h2 className="page-title">Events</h2>
          <p className="page-subtitle">Manage and track all events</p>
        </div>
        <div className="header-actions">
          {!isProfessor() && (
            <button className="btn-join" onClick={() => setShowJoinModal(true)}>
              Join Event
            </button>
          )}
          {isProfessor() && (
            <button
              className="btn-create"
              onClick={() => setShowCreateModal(true)}
            >
              <span className="btn-icon">+</span> Create Event
            </button>
          )}
        </div>
      </div>

      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="filter-options">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            {eventTypes.map((type) => (
              <option key={type} value={type}>
                {type === "ALL" ? "All Types" : type}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            {eventStatuses.map((status) => (
              <option key={status} value={status}>
                {status === "ALL" ? "All Statuses" : status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="events-table-container">
        {filteredEvents.length > 0 ? (
          <div className="events-grid">
            {filteredEvents.map((event) => {
              const startDate = new Date(event.startTime);
              const endDate = new Date(event.endTime);
              const now = new Date();
              const isUpcoming = startDate > now;
              const isActive = event.status === "OPEN";
              const isFull = event.status === "FULL";
              const isRunning = now >= startDate && now <= endDate;
              const hasEnded = now > endDate;

              return (
                <div key={event.id} className="event-card">
                  <div className="event-card-header">
                    <h3 className="event-title">{event.name}</h3>
                    <div className="status-container">
                      <span
                        className={`event-status-badge status-${event.status?.toLowerCase()}`}
                      >
                        {isFull
                          ? "FULL"
                          : isUpcoming && isActive
                          ? "UPCOMING"
                          : event.status}
                      </span>
                    </div>
                  </div>

                  <div className="event-description">
                    {event.description || "No description provided"}
                  </div>

                  <div className="event-details">
                    <div className="detail-item">
                      <span className="detail-label">Start Date:</span>
                      <span className="detail-value">
                        {startDate.toLocaleDateString()}{" "}
                        {startDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">End Date:</span>
                      <span className="detail-value">
                        {endDate.toLocaleDateString()}{" "}
                        {endDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Type:</span>
                      <span className="detail-value type-badge">
                        {event.eventType || "General"}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Participants:</span>
                      <span className="detail-value">
                        <span className="current-participants">
                          {event.currentParticipants || 0}
                        </span>
                        <span className="capacity-separator">/</span>
                        <span className="max-participants">
                          {event.maxParticipants}
                        </span>
                        {isFull && <span className="full-badge"> FULL</span>}
                      </span>
                    </div>

                    {isProfessor() && event.textCode && (
                      <div className="detail-item">
                        <span className="detail-label">Join Code:</span>
                        <span className="detail-value code-display">
                          <span className="code-text">{event.textCode}</span>
                          <button
                            className="btn-copy-code"
                            onClick={() => {
                              navigator.clipboard.writeText(event.textCode);
                              alert("Code copied!");
                            }}
                            title="Copy code"
                          >
                            📋
                          </button>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="event-card-footer">
                    {isProfessor() ? (
                      <div className="event-actions">
                        <button
                          className="btn-add-manual"
                          onClick={() => openAddManualModal(event.id)}
                          title="Add Student"
                        >
                          ➕
                        </button>
                        <button
                          className="btn-view"
                          onClick={() => handleViewParticipants(event.id)}
                        >
                          Participants
                        </button>
                        <ExportButton type="event" id={event.id} />
                        <button
                          className="btn-edit"
                          onClick={() => handleEditEvent(event)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <div className="student-actions">
                        {!hasEnded && event.status === "OPEN" && !isFull && (
                          <span className="join-hint">
                            Ask the professor for the join code
                          </span>
                        )}
                        {isFull && (
                          <span className="full-message">Event is full</span>
                        )}
                        {(event.status === "CLOSED" || hasEnded) && (
                          <span className="closed-message">
                            Registration closed
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <h4>No events found</h4>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingEvent ? "Edit Event" : "Create New Event"}</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingEvent(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
            >
              <div className="modal-body">
                <div className="form-group">
                  <label>Event Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Event Type</label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="Workshop">Workshop</option>
                      <option value="Lecture">Lecture</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Conference">Conference</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Max Participants</label>
                    <input
                      type="number"
                      name="maxParticipants"
                      value={formData.maxParticipants}
                      onChange={handleInputChange}
                      min="1"
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="CLOSED">CLOSED</option>
                    <option value="OPEN">OPEN</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="form-textarea"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingEvent ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Join Event</h3>
              <button
                className="modal-close"
                onClick={() => setShowJoinModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleJoinEvent}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Code</label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => {
                      setJoinCode(e.target.value.toUpperCase());
                      setJoinError("");
                    }}
                    placeholder="EVT-XXXXXXXX"
                    className="form-input join-code-input"
                    autoFocus
                  />
                  {joinError && (
                    <div className="error-message">{joinError}</div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowJoinModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!joinCode.trim()}
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingParticipants && (
        <div className="modal-overlay">
          <div
            className="modal participants-modal"
            style={{ maxWidth: "800px" }}
          >
            <div className="modal-header">
              <h3>{viewingParticipants.name} - Participants</h3>
              <button
                className="modal-close"
                onClick={() => setViewingParticipants(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {participantsList.length > 0 ? (
                <table className="participants-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantsList.map((att) => (
                      <tr key={att.id}>
                        <td>{att.Participant?.name}</td>
                        <td>{att.Participant?.email}</td>
                        <td>
                          {att.confirmedAt
                            ? new Date(att.confirmedAt).toLocaleTimeString()
                            : "-"}
                        </td>
                        <td>
                          <select
                            value={att.status}
                            onChange={(e) =>
                              handleStatusChange(att.id, e.target.value)
                            }
                            className={`status-select status-${att.status?.toLowerCase()}`}
                          >
                            <option value="PRESENT">✅ Present</option>
                            <option value="ABSENT">❌ Absent</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No participants yet.</p>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setViewingParticipants(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddManualModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Student</h3>
              <button
                className="modal-close"
                onClick={() => setShowAddManualModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Search by name..."
                className="form-input"
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
              />
              <div
                className="students-list-manual"
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  marginTop: "15px",
                }}
              >
                {allStudents
                  .filter((s) =>
                    s.name.toLowerCase().includes(searchStudent.toLowerCase())
                  )
                  .map((student) => (
                    <div
                      key={student.id}
                      className="student-manual-item"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px",
                      }}
                    >
                      <span>{student.name}</span>
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => handleAddStudentToEvent(student.id)}
                      >
                        Add
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
