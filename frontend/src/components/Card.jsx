import React from "react";
import "../styles/Card.css";

export default function Card({ title, value, icon, color = 'blue', trend }) {
  const colorClasses = {
    blue: 'card-blue',
    green: 'card-green',
    purple: 'card-purple',
    orange: 'card-orange',
    yellow: 'card-yellow',
    red: 'card-red'
  };

  const colorClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`card ${colorClass}`}>
      <div className="card-header">
        <div className="card-icon">{icon}</div>
        <span className="card-title">{title}</span>
      </div>
      <div className="card-content">
        <p className="card-value">{value}</p>
        {trend && <span className="card-trend">{trend}</span>}
      </div>
    </div>
  );
}