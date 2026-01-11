const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Attendance = sequelize.define("Attendance", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  participantId: DataTypes.INTEGER,
  eventId: DataTypes.INTEGER,
  confirmedAt: DataTypes.DATE,
  ipAddress: DataTypes.STRING,
  status: DataTypes.STRING,
});

module.exports = Attendance;

//blah b;ah
