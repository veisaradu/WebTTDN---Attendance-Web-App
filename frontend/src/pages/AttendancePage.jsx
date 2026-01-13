import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Attendance.css";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const { token, user } = useAuth(); // Adaugă user din context

  useEffect(() => {
    fetchAttendance();
    fetchEvents();
    fetchParticipants();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await fetch("http://localhost:5000/attendance", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      // Dacă e student, filtrează doar înregistrările lui
      if (user?.role === 'STUDENT') {
        const studentAttendance = data.filter(record => 
          record.participantId === user.id
        );
        setAttendance(studentAttendance || []);
      } else {
        // Profesor/admin vede tot
        setAttendance(data || []);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await fetch("http://localhost:5000/participants", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setParticipants(data || []);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const getEventName = (eventId) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.name : `Event ${eventId}`;
  };

  const getParticipantName = (participantId) => {
    const participant = participants.find(p => p.id === participantId);
    return participant ? participant.name : `Participant ${participantId}`;
  };

  const getParticipantEmail = (participantId) => {
    const participant = participants.find(p => p.id === participantId);
    return participant ? participant.email : '';
  };

  if (loading) {
    return <div className="loading-spinner">Loading attendance records...</div>;
  }

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div>
          <h2 className="page-title">
            {user?.role === 'STUDENT' ? 'My Attendance' : 'Attendance Records'}
          </h2>
          <p className="page-subtitle">
            {user?.role === 'STUDENT' 
              ? 'View your attendance history' 
              : 'Track and manage event attendance'
            }
          </p>
        </div>
      </div>

      {/* Stats Summary - Doar pentru studenți dacă au înregistrări */}
      {(user?.role === 'STUDENT' && attendance.length > 0) && (
        <div className="attendance-summary">
          <div className="summary-card">
            <div className="summary-icon total">📋</div>
            <div className="summary-content">
              <div className="summary-value">{attendance.length}</div>
              <div className="summary-label">Total Records</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon present">✅</div>
            <div className="summary-content">
              <div className="summary-value">
                {attendance.filter(a => a.status === 'PRESENT').length}
              </div>
              <div className="summary-label">Present</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon absent">❌</div>
            <div className="summary-content">
              <div className="summary-value">
                {attendance.filter(a => a.status === 'ABSENT').length}
              </div>
              <div className="summary-label">Absent</div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="attendance-table-container">
        {attendance.length > 0 ? (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Event</th>
                {user?.role !== 'STUDENT' && <th>Participant</th>}
                <th>Status</th>
                <th>Confirmed At</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map(record => {
                const event = events.find(e => e.id === record.eventId);
                const participant = participants.find(p => p.id === record.participantId);
                
                return (
                  <tr key={record.id} className="attendance-row">
                    <td className="record-id">#{record.id}</td>
                    <td className="event-info">
                      <div className="event-name">{getEventName(record.eventId)}</div>
                      {event && (
                        <div className="event-details">
                          <div className="event-date">
                            {new Date(event.startTime).toLocaleDateString()}
                          </div>
                          <div className="event-location">
                            📍 {event.location}
                          </div>
                        </div>
                      )}
                    </td>
                    
                    {/* Ascunde coloana Participant pentru studenți */}
                    {user?.role !== 'STUDENT' && (
                      <td className="participant-info">
                        <div className="participant-name">{getParticipantName(record.participantId)}</div>
                        <div className="participant-email">{getParticipantEmail(record.participantId)}</div>
                      </td>
                    )}
                    
                    <td>
                      <span className={`status-badge status-${record.status?.toLowerCase() || 'present'}`}>
                        {record.status || 'PRESENT'}
                      </span>
                    </td>
                    <td className="confirmed-time">
                      {record.confirmedAt ? (
                        <>
                          <div className="date">{new Date(record.confirmedAt).toLocaleDateString()}</div>
                          <div className="time">{new Date(record.confirmedAt).toLocaleTimeString()}</div>
                        </>
                      ) : (
                        'Not confirmed'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h4>
              {user?.role === 'STUDENT' 
                ? 'No attendance records found for you' 
                : 'No attendance records found'
              }
            </h4>
            <p>
              {user?.role === 'STUDENT'
                ? 'Your attendance records will appear here when professors mark your attendance.'
                : 'Start recording attendance for your events'
              }
            </p>
            
            {/* Mesaj special pentru studenți */}
            {user?.role === 'STUDENT' && (
              <div className="student-info-message">
                <p><strong>Note for students:</strong></p>
                <p>Professors will manually mark attendance for events. You can view your attendance history here.</p>
                <ul>
                  <li>✅ <strong>PRESENT</strong> - You attended the event</li>
                  <li>❌ <strong>ABSENT</strong> - You were marked absent</li>
                  <li>⏰ <strong>LATE</strong> - You arrived late</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mesaj informativ pentru studenți dacă nu au înregistrări */}
      {user?.role === 'STUDENT' && attendance.length === 0 && (
        <div className="student-guide">
          <h3>How Attendance Works</h3>
          <div className="guide-steps">
            <div className="guide-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Professors Create Events</h4>
                <p>Professors create events in the system with date, time, and location.</p>
              </div>
            </div>
            <div className="guide-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Attendance is Recorded</h4>
                <p>Professors manually mark attendance for each participant after the event.</p>
              </div>
            </div>
            <div className="guide-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>View Your History</h4>
                <p>You can view all your attendance records on this page.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}