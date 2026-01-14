import React from "react";
import "../styles/Card.css";

export default function Card({ title, value, icon, color = 'blue', trend }) {


  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">{icon}</div>
        <span className="card-title">{title}</span>
      </div>
      <div className="card-content">
        <p className="card-value">{value}</p>
        
      </div>
    </div>
  );
}