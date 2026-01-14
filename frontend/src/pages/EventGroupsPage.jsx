import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "../styles/EventGroups.css";
import ExportButton from "../components/ExportButton";
import API_URL from "../config";

export default function EventGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddEventsModal, setShowAddEventsModal] = useState(null);

  const [selectedEvents, setSelectedEvents] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const { token, isProfessor } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const groupsResponse = await fetch(`https://${API_URL}/event-groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (groupsResponse.ok) {
        const data = await groupsResponse.json();
        setGroups(Array.isArray(data) ? data : []);
      }

      const eventsResponse = await fetch(`https://${API_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (eventsResponse.ok) {
        const data = await eventsResponse.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://${API_URL}/event-groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({ name: "", description: "" });
        fetchData();
      } else {
        const err = await response.json();
        alert(`Error: ${err.error || "Failed to create group"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Network error");
    }
  };

  const handleAddEventsToGroup = async (groupId) => {
    if (selectedEvents.length === 0) {
      alert("Please select at least one event.");
      return;
    }

    try {
      const payload = {
        eventIds: selectedEvents.map((id) => parseInt(id, 10)),
      };

      const response = await fetch(
        `https://${API_URL}/event-groups/${groupId}/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setShowAddEventsModal(null);
        setSelectedEvents([]);
        fetchData();
        alert("Events added successfully!");
      } else {
        const err = await response.json();
        alert(`Error: ${err.error || "Failed to add events"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Network error");
    }
  };

  const handleRemoveEventFromGroup = async (groupId, eventId) => {
    if (!window.confirm("Remove event from group?")) return;
    try {
      const response = await fetch(
        `https://${API_URL}/event-groups/${groupId}/events/${eventId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Delete this group?")) return;
    try {
      const response = await fetch(
        `https://${API_URL}/event-groups/${groupId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleEventSelection = (eventId) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  if (loading) return <div>Loading...</div>;

  const activeGroup = groups.find((g) => g.id === showAddEventsModal);

  const existingEvents = activeGroup
    ? activeGroup.Events || activeGroup.events || []
    : [];

  const availableEvents = showAddEventsModal
    ? events.filter((event) => !existingEvents.some((e) => e.id === event.id))
    : [];

  return (
    <div className="event-groups-page">
      <div className="page-header">
        <div>
          <h2>Event Groups</h2>
          <p>Manage and organize your events</p>
        </div>
        {isProfessor() && (
          <button
            className="btn-create"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Group
          </button>
        )}
      </div>

      <div className="groups-grid">
        {groups.map((group) => {
          const groupEvents = group.Events || group.events || [];

          return (
            <div key={group.id} className="group-card">
              <div className="group-header">
                <h3>{group.name}</h3>
                <p className="group-description">
                  {group.description || "No description"}
                </p>

                <div className="group-events">
                  <strong>Events ({groupEvents.length}):</strong>
                  {groupEvents.length > 0 ? (
                    <ul className="events-list">
                      {groupEvents.map((event) => (
                        <li key={event.id} className="event-item">
                          <span>{event.name}</span>
                          {isProfessor() && (
                            <button
                              className="btn-remove"
                              onClick={() =>
                                handleRemoveEventFromGroup(group.id, event.id)
                              }
                              title="Remove from group"
                            >
                              ×
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p
                      style={{
                        color: "#9ca3af",
                        fontStyle: "italic",
                        marginTop: "0.5rem",
                      }}
                    >
                      No events added yet.
                    </p>
                  )}
                </div>
              </div>

              {isProfessor() && (
                <div className="group-footer">
                  <button
                    className="btn-add-events"
                    onClick={() => setShowAddEventsModal(group.id)}
                  >
                    + Add Events
                  </button>
                  <ExportButton type="group" id={group.id} />
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteGroup(group.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create New Group</h3>
            <form onSubmit={handleCreateGroup}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Group Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="E.g., Math 101 Labs"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Optional description"
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
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddEventsModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Events to Group</h3>
            <div className="modal-body">
              {availableEvents.length > 0 ? (
                availableEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`event-select-card ${
                      selectedEvents.includes(event.id) ? "selected" : ""
                    }`}
                    onClick={() => toggleEventSelection(event.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event.id)}
                      readOnly
                    />
                    <div>
                      <strong>{event.name}</strong>
                      <br />
                      <small style={{ color: "#64748b" }}>
                        {new Date(event.startTime).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <p>
                  No available events found (all events might already be in this
                  group).
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowAddEventsModal(null);
                  setSelectedEvents([]);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleAddEventsToGroup(showAddEventsModal)}
                disabled={selectedEvents.length === 0}
              >
                Add Selected ({selectedEvents.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
