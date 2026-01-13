const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");
const crypto = require("crypto");

const Event = sequelize.define("Event", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  groupId: { 
    type: DataTypes.INTEGER,
    references: {
      model: 'EventGroups',
      key: 'id'
    },
    allowNull: true 
  },
  name: DataTypes.STRING,
  status: { 
    type: DataTypes.ENUM('OPEN', 'CLOSED', 'FULL'),
    defaultValue: "CLOSED" 
  },
  startTime: DataTypes.DATE,
  endTime: DataTypes.DATE,
  maxParticipants: DataTypes.INTEGER,
  description: DataTypes.STRING,
  eventType: DataTypes.STRING,
  qrCode: DataTypes.STRING,
  textCode: {
    type: DataTypes.STRING,
    unique: true
  },
  currentParticipants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  hooks: {
    beforeCreate: (event) => {
      // Generează cod unic dacă nu există
      if (!event.textCode) {
        event.textCode = generateTextCode();
      }
      if (!event.qrCode) {
        event.qrCode = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
    }
  }
});

// Funcție pentru generarea codului text
function generateTextCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EVT-${code}`;
}

module.exports = Event;