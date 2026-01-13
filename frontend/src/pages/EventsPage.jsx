import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Events.css";
import ExportButton from '../components/ExportButton';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    maxParticipants: 50,
    description: '',
    eventType: 'Workshop',
    status: 'CLOSED'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const { token, isProfessor, user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:5000/events", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error("HTTP error:", response.status, response.statusText);
        setEvents([]);
        setLoading(false);
        return;
      }
      
      // Verifică dacă răspunsul este JSON valid
      const text = await response.text();
      if (!text) {
        setEvents([]);
        setLoading(false);
        return;
      }
      
      const data = JSON.parse(text);
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrare evenimente
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'ALL' || event.eventType === filterType;
    const matchesStatus = filterStatus === 'ALL' || event.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Obține tipuri unice pentru filtru
  const eventTypes = ['ALL', ...new Set(events.map(e => e.eventType).filter(Boolean))];
  const eventStatuses = ['ALL', 'OPEN', 'CLOSED', 'FULL'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Funcție pentru join la eveniment
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
      const response = await fetch("http://localhost:5000/event-join/join", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          textCode: joinCode.toUpperCase().trim(),
          participantId: user.id
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(`✅ Successfully joined event: ${data.event?.name || 'the event'}`);
        setShowJoinModal(false);
        setJoinCode("");
        fetchEvents();
      } else {
        setJoinError(data.error || "Failed to join event");
      }
    } catch (error) {
      console.error("Error joining event:", error);
      setJoinError("Network error. Please try again.");
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/events", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString()
        })
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        resetForm();
        fetchEvents();
        alert('Event created successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to create event: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert('Failed to create event');
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      startTime: event.startTime ? event.startTime.slice(0, 16) : '',
      endTime: event.endTime ? event.endTime.slice(0, 16) : '',
      maxParticipants: event.maxParticipants || 50,
      description: event.description || '',
      eventType: event.eventType || 'Workshop',
      status: event.status || 'CLOSED'
    });
    setShowCreateModal(true);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/events/${editingEvent.id}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString()
        })
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        setEditingEvent(null);
        resetForm();
        fetchEvents();
        alert('Event updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`Failed to update event: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event? This will also delete all attendance records for this event.")) {
      try {
        const response = await fetch(`http://localhost:5000/events/${eventId}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          fetchEvents();
          alert('Event deleted successfully!');
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(`Failed to delete event: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        alert('Failed to delete event');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      startTime: '',
      endTime: '',
      maxParticipants: 50,
      description: '',
      eventType: 'Workshop',
      status: 'CLOSED'
    });
  };

  if (loading) {
    return <div className="loading-spinner">Loading events...</div>;
  }

  return (
    <div className="events-page">
      <div className="events-header">
        <div>
          <h2 className="page-title">Events</h2>
          <p className="page-subtitle">Manage and track all events</p>
        </div>
        
        <div className="header-actions">
          {!isProfessor() && (
            <button 
              className="btn-join"
              onClick={() => setShowJoinModal(true)}
            >
              🔗 Join Event
            </button>
          )}
          
          {isProfessor() && (
            <button 
              className="btn-create"
              onClick={() => setShowCreateModal(true)}
            >
              <span className="btn-icon">+</span>
              Create Event
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
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
            {eventTypes.map(type => (
              <option key={type} value={type}>
                {type === 'ALL' ? 'All Types' : type}
              </option>
            ))}
          </select>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            {eventStatuses.map(status => (
              <option key={status} value={status}>
                {status === 'ALL' ? 'All Statuses' : status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="events-summary">
        <div className="summary-card">
          <div className="summary-icon total">📅</div>
          <div className="summary-content">
            <div className="summary-value">{events.length}</div>
            <div className="summary-label">Total Events</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon active">🔴</div>
          <div className="summary-content">
            <div className="summary-value">
              {events.filter(e => e.status === 'OPEN').length}
            </div>
            <div className="summary-label">Active</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon upcoming">⏰</div>
          <div className="summary-content">
            <div className="summary-value">
              {events.filter(e => new Date(e.startTime) > new Date()).length}
            </div>
            <div className="summary-label">Upcoming</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon closed">✅</div>
          <div className="summary-content">
            <div className="summary-value">
              {events.filter(e => e.status === 'CLOSED' || e.status === 'FULL').length}
            </div>
            <div className="summary-label">Completed/Full</div>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="events-table-container">
        {filteredEvents.length > 0 ? (
          <div className="events-grid">
            {filteredEvents.map(event => {
              const startDate = new Date(event.startTime);
              const endDate = new Date(event.endTime);
              const now = new Date();
              const isUpcoming = startDate > now;
              const isActive = event.status === 'OPEN';
              const isFull = event.status === 'FULL';
              const isRunning = now >= startDate && now <= endDate;
              const hasEnded = now > endDate;
              
              return (
                <div key={event.id} className="event-card">
                  <div className="event-card-header">
                    <h3 className="event-title">{event.name}</h3>
                    <div className="status-container">
                      <span className={`event-status-badge status-${event.status?.toLowerCase() || 'closed'}`}>
                        {isFull ? 'FULL' : isUpcoming && isActive ? 'UPCOMING' : event.status || 'CLOSED'}
                      </span>
                      {isRunning && (
                        <span className="time-indicator running">▶️ LIVE</span>
                      )}
                      {hasEnded && (
                        <span className="time-indicator ended">⏹️ ENDED</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="event-description">
                    {event.description || 'No description provided'}
                  </div>
                  
                  <div className="event-details">
                    <div className="detail-item">
                      <span className="detail-label">📅 Date:</span>
                      <span className="detail-value">
                        {startDate.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">⏰ Time:</span>
                      <span className="detail-value">
                        {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                        {endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">🏷️ Type:</span>
                      <span className="detail-value type-badge">
                        {event.eventType || 'General'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">👥 Participants:</span>
                      <span className="detail-value">
                        <span className="current-participants">{event.currentParticipants || 0}</span>
                        <span className="capacity-separator">/</span>
                        <span className="max-participants">
                          {event.maxParticipants || '∞'}
                        </span>
                        {isFull && <span className="full-badge"> FULL</span>}
                      </span>
                    </div>
                    
                    {/* Afișează codul text pentru profesori */}
                    {isProfessor() && event.textCode && (
                      <div className="detail-item">
                        <span className="detail-label">🔑 Join Code:</span>
                        <span className="detail-value code-display">
                          <span className="code-text">{event.textCode}</span>
                          <button 
                            className="btn-copy-code"
                            onClick={() => {
                              navigator.clipboard.writeText(event.textCode);
                              alert("Code copied to clipboard!");
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
                        <ExportButton type="event" id={event.id} />
                        <button 
                          className="btn-edit"
                          onClick={() => handleEditEvent(event)}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    ) : (
                      <div className="student-actions">
                        {!hasEnded && event.status === 'OPEN' && !isFull && (
                          <span className="join-hint">
                            Ask the professor for the join code
                          </span>
                        )}
                        {isFull && (
                          <span className="full-message">Event is full</span>
                        )}
                        {(event.status === 'CLOSED' || hasEnded) && (
                          <span className="closed-message">Registration closed</span>
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
            <div className="empty-icon">📅</div>
            <h4>No events found</h4>
            <p>{searchTerm || filterType !== 'ALL' || filterStatus !== 'ALL' 
              ? 'Try changing your search or filters' 
              : 'Create your first event to get started'}
            </p>
            {isProfessor() && !searchTerm && filterType === 'ALL' && filterStatus === 'ALL' && (
              <button 
                className="btn-create"
                onClick={() => setShowCreateModal(true)}
              >
                Create Event
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Event Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
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
            <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Event Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter event name"
                    className="form-input"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time *</label>
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
                    <label>End Time *</label>
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
                      placeholder="Maximum participants"
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
                    placeholder="Event description"
                    className="form-textarea"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Event Modal */}
      {showJoinModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Join Event</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowJoinModal(false);
                  setJoinCode("");
                  setJoinError("");
                }}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleJoinEvent}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Enter Event Code</label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => {
                      setJoinCode(e.target.value.toUpperCase());
                      setJoinError("");
                    }}
                    placeholder="Enter code (e.g., EVT-ABCD1234)"
                    className="form-input join-code-input"
                    autoFocus
                  />
                  {joinError && (
                    <div className="error-message">
                      ❌ {joinError}
                    </div>
                  )}
                  <p className="form-hint">
                    Get the code from your professor
                  </p>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode("");
                    setJoinError("");
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn-primary"
                  disabled={!joinCode.trim()}
                >
                  Join Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}