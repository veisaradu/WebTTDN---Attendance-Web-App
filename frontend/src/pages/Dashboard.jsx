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
      // 1. Stats fetch (Backend calculates total counts)
      const statsResponse = await fetch("http://localhost:5000/stats", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsResponse.json();
      
      // 2. Events fetch (Backend already closed expired events)
      const eventsResponse = await fetch("http://localhost:5000/events", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const eventsData = await eventsResponse.json() || [];
      
      // 3. Count local metrics based on FRESH data
      const now = new Date();
      
      // Note: We don't need complex logic for 'Active' anymore, simply check status
      const activeEvents = eventsData.filter(event => event.status === 'OPEN').length;
      
      // Upcoming is just future start time
      const upcomingEvents = eventsData.filter(event => new Date(event.startTime) > now).length;

      setStats({
        ...statsData,
        upcomingEvents,
        activeEvents
      });

      // Sort by Start Time
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
        <Card title="Total Events" value={stats.totalEvents}  color="blue" />
        <Card title="Event Groups" value={stats.totalEventGroups} color="orange" />
        <Card title="Active Events" value={stats.activeEvents}  color="red" trend="Open now" />
        {/* You removed upcoming, but I left variable calculation just in case */}
      </div>

      {/* Recent Events Table */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3 className="section-title">Recent Events</h3>
          <button className="btn btn-primary" onClick={() => window.location.href = '/events'}>View All</button>
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
                  const currentCount = event.currentParticipants || 0;
                  
                  return (
                    <tr key={event.id} className="event-row">
                      <td className="event-name">
                        <div className="event-name-main">{event.name}</div>
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
                        {/* Simply use the DB status now */}
                        <span className={`status-badge status-${event.status?.toLowerCase()}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="event-participants">
                        <div className="participants-info">
                          <span className="current-count">{currentCount}</span>
                          <span className="separator">/</span>
                          <span className="max-count">{event.maxParticipants || '∞'}</span>
                        </div>
                      </td>
                      <td className="event-actions">
                        <button className="btn btn-sm btn-outline" onClick={() => window.location.href = `/attendance?event=${event.id}`}>
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
            <h4>No events yet</h4>
          </div>
        )}
      </div>
    </div>
  );
}