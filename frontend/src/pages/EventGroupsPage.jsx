import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "../styles/EventGroups.css";
import ExportButton from "../components/ExportButton";

export default function EventGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddEventsModal, setShowAddEventsModal] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const { token, isProfessor } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch groups
      const groupsResponse = await fetch("http://localhost:5000/event-groups", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        setGroups(groupsData || []);
      }
      
      // Fetch all events for selection
      const eventsResponse = await fetch("http://localhost:5000/events", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData || []);
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
      const response = await fetch("http://localhost:5000/event-groups", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        setFormData({ name: '', description: '' });
        fetchData();
      } else {
        alert('Failed to create group');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  const handleAddEventsToGroup = async (groupId) => {
    if (selectedEvents.length === 0) return;

    try {
      const response = await fetch(`http://localhost:5000/event-groups/${groupId}/events`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventIds: selectedEvents })
      });
      
      if (response.ok) {
        setShowAddEventsModal(null);
        setSelectedEvents([]);
        fetchData(); // Reîmprospătăm datele
        alert(`Events added successfully!`);
      } else {
        alert('Failed to add events');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  const handleRemoveEventFromGroup = async (groupId, eventId) => {
    if (window.confirm("Remove event from group?")) {
      try {
        const response = await fetch(`http://localhost:5000/event-groups/${groupId}/events/${eventId}`, {
          method: "DELETE",
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm("Delete this group?")) {
      try {
        const response = await fetch(`http://localhost:5000/event-groups/${groupId}`, {
          method: "DELETE",
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const toggleEventSelection = (eventId) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;

  // Logică pentru modalul de adăugare evenimente
  const activeGroupForModal = groups.find(g => g.id === showAddEventsModal);
  
  // Normalizăm lista de evenimente din grup (Events vs events)
  const activeGroupEvents = activeGroupForModal 
    ? (activeGroupForModal.Events || activeGroupForModal.events || [])
    : [];

  const availableEvents = showAddEventsModal 
    ? events.filter(event => !activeGroupEvents.some(e => e.id === event.id))
    : [];

  return (
    <div className="event-groups-page">
      <div className="page-header">
        <div>
          <h2>Event Groups</h2>
          <p>Manage groups</p>
        </div>
        {isProfessor() && (
          <button className="btn-create" onClick={() => setShowCreateModal(true)}>
            + Create Group
          </button>
        )}
      </div>

      <div className="groups-grid">
        {groups.map(group => {
          // 👇 AICI ESTE FIX-UL PRINCIPAL: Verificăm ambele variante de nume
          const groupEvents = group.Events || group.events || [];
          
          return (
            <div key={group.id} className="group-card">
              <div className="group-header">
                <h3>{group.name}</h3>
                <p className="group-description">{group.description}</p>
                
                <div className="group-events">
                  <h4>Events in this group ({groupEvents.length}):</h4>
                  {groupEvents.length > 0 ? (
                    <ul className="events-list">
                      {groupEvents.map(event => (
                        <li key={event.id} className="event-item">
                          <span>{event.name}</span>
                          {isProfessor() && (
                            <button 
                              className="btn-remove"
                              onClick={() => handleRemoveEventFromGroup(group.id, event.id)}
                            >
                              ×
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-events">No events added yet</p>
                  )}
                </div>
              </div>
              
              <div className="group-footer">
                {isProfessor() && (
                  <div className="group-actions">
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
            </div>
          );
        })}
      </div>

      {/* MODAL CREATE GROUP */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create Group</h3>
            <form onSubmit={handleCreateGroup}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  className="form-input"
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADD EVENTS */}
      {showAddEventsModal && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <h3>Add Events to Group</h3>
            <div className="modal-body">
              {availableEvents.length > 0 ? (
                availableEvents.map(event => (
                  <div 
                    key={event.id} 
                    className={`event-select-card ${selectedEvents.includes(event.id) ? 'selected' : ''}`}
                    onClick={() => toggleEventSelection(event.id)}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedEvents.includes(event.id)} 
                      readOnly 
                    />
                    <div style={{marginLeft: '10px'}}>
                      <strong>{event.name}</strong>
                      <br/>
                      <small>{new Date(event.startTime).toLocaleDateString()}</small>
                    </div>
                  </div>
                ))
              ) : (
                <p>No available events to add.</p>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => {
                setShowAddEventsModal(null);
                setSelectedEvents([]);
              }}>Cancel</button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => handleAddEventsToGroup(showAddEventsModal)}
                disabled={selectedEvents.length === 0}
              >
                Add Selected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}