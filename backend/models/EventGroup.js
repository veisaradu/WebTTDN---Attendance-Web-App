const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const EventGroup = sequelize.define("EventGroup", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: DataTypes.STRING,
  description: DataTypes.STRING,
  recurrencePattern: DataTypes.STRING, 
  recurrenceDays: DataTypes.STRING, 
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  eventTime: DataTypes.TIME,
  eventDuration: DataTypes.INTEGER,
  maxParticipants: DataTypes.INTEGER,
  eventType: DataTypes.STRING,
});

module.exports = EventGroup;