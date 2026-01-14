import React, { useEffect, useState } from "react";
import Card from "../components/Card";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalParticipants: 0,
    totalAttendance: 0,
    totalEventGroups: 0,
    upcomingEvents: 0,
    activeEvents: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      
      const statsResponse = await fetch("http://localhost:5000/stats", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const statsData = await statsResponse.json();
      
     
      const eventsResponse = await fetch("http://localhost:5000/events", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const eventsData = await eventsResponse.json() || [];
      
     
      const now = new Date();
      const upcomingEvents = eventsData.filter(event => 
        new Date(event.startTime) > now
      ).length;
      
      const activeEvents = eventsData.filter(event => 
        event.status === 'OPEN'
      ).length;

      setStats({
        ...statsData,
        upcomingEvents,
        activeEvents
      });

   
      const sorted = eventsData.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      setRecentEvents(sorted.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h2 className="page-title">Dashboard Overview</h2>
        <div className="welcome-message">
          
          
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="stats-grid">
        <Card 
          title="Total Events" 
          value={stats.totalEvents}
          
          
          trend={`${stats.activeEvents} active`}
        />
        
      
        <Card 
          title="Event Groups" 
          value={stats.totalEventGroups} 
          
          
        />
       
        <Card 
          title="Active Events" 
          value={stats.activeEvents} 
          
         
        />
      </div>

      {/* Recent Events */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">
            
            Recent Events
          </h3>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/events'}
          >
            View All Events
          </button>
        </div>
        
        {recentEvents.length > 0 ? (
          <div className="events-table-container">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Participants</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map(event => {
                  const startDate = new Date(event.startTime);
                  const endDate = new Date(event.endTime);
                  
                  
                  const currentCount = event.currentParticipants || (event.Attendances ? event.Attendances.length : 0);
                  
                  return (
                    <tr key={event.id} className="event-row">
                      <td className="event-name">
                        <div className="event-name-main">{event.name}</div>
                        {event.description && (
                          <div className="event-description">{event.description}</div>
                        )}
                      </td>
                      <td className="event-time">
                        <div className="event-date">{startDate.toLocaleDateString()}</div>
                        <div className="event-time-range">
                          {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                          {endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </td>
                      <td className="event-type">
                        <span className="type-badge">{event.eventType || 'General'}</span>
                      </td>
                      <td className="event-status">
                        <span className={`status-badge status-${event.status?.toLowerCase() || 'closed'}`}>
                          {event.status || 'CLOSED'}
                        </span>
                      </td>
                      <td className="event-participants">
                        <div className="participants-info">
                          {/* UPDATED LINE BELOW */}
                          <span className="current-count">{currentCount}</span>
                          <span className="separator">/</span>
                          <span className="max-count">{event.maxParticipants || '∞'}</span>
                        </div>
                      </td>
                      <td className="event-actions">
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => window.location.href = `/attendance?event=${event.id}`}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h4>No events yet</h4>
            <p>Create your first event to get started</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/events'}
            >
              Create Event
            </button>
          </div>
        )}
      </div>

      
    </div>
  );
}