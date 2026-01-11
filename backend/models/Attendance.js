const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Attendance = sequelize.define("Attendance", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  participantId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  confirmedAt: DataTypes.DATE,
  ipAddress: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM('PRESENT', 'ABSENT', 'LATE'),
    defaultValue: 'PRESENT'
  }
}, {
  timestamps: true
});

module.exports = Attendance;