import { useEffect, useState } from "react";

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/") // URL-ul backend-ului
      .then(res => res.json())
      .then(data => setEvents(data.events))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Events</h1>
      <ul>
        {events.map(event => (
          <li key={event.id}>{event.name} ({event.status})</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
