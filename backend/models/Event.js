const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

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
  status: { type: DataTypes.STRING, defaultValue: "CLOSED" },
  startTime: DataTypes.DATE,
  endTime: DataTypes.DATE,
  maxParticipants: DataTypes.INTEGER,
  description: DataTypes.STRING,
  eventType: DataTypes.STRING,
  qrCode: DataTypes.STRING,
  textCode: DataTypes.STRING,
});

module.exports = Event;