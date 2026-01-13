const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const EventGroup = sequelize.define("EventGroup", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  name: { 
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.STRING,
  recurrencePattern: DataTypes.STRING, 
  recurrenceDays: DataTypes.STRING, 
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  eventTime: DataTypes.TIME,
  eventDuration: DataTypes.INTEGER,
  maxParticipants: DataTypes.INTEGER,
  eventType: DataTypes.STRING,
}, {
  tableName: 'event_groups',
  timestamps: true
});

module.exports = EventGroup;