import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Events.css";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
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
      const data = await response.json();
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrare evenimente
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'ALL' || event.eventType === filterType;
    const matchesStatus = filterStatus === 'ALL' || event.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Obține tipuri unice pentru filtru
  const eventTypes = ['ALL', ...new Set(events.map(e => e.eventType).filter(Boolean))];
  const eventStatuses = ['ALL', 'OPEN', 'CLOSED'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
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
              {events.filter(e => e.status === 'CLOSED').length}
            </div>
            <div className="summary-label">Completed</div>
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
              const isUpcoming = startDate > new Date();
              const isActive = event.status === 'OPEN';
              
              return (
                <div key={event.id} className="event-card">
                  <div className="event-card-header">
                    <h3 className="event-title">{event.name}</h3>
                    <span className={`event-status-badge status-${event.status?.toLowerCase() || 'closed'}`}>
                      {isUpcoming && isActive ? 'UPCOMING' : event.status || 'CLOSED'}
                    </span>
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
                      <span className="detail-label">👥 Capacity:</span>
                      <span className="detail-value">
                        <span className="current-participants">0</span>
                        <span className="capacity-separator">/</span>
                        <span className="max-participants">
                          {event.maxParticipants || '∞'}
                        </span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="event-card-footer"> 
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
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                Create Event
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
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
                
                
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}