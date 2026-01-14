const Event = require("./Event");
const EventGroup = require("./EventGroup");
const Participant = require("./Participant");
const Attendance = require("./Attendance");

EventGroup.hasMany(Event, {
  foreignKey: "groupId",
  as: "Events",
  onDelete: "CASCADE",
});
Event.belongsTo(EventGroup, { foreignKey: "groupId", as: "Group" });

Event.hasMany(Attendance, { foreignKey: "eventId", onDelete: "CASCADE" });
Attendance.belongsTo(Event, { foreignKey: "eventId" });

Participant.hasMany(Attendance, {
  foreignKey: "participantId",
  onDelete: "CASCADE",
});
Attendance.belongsTo(Participant, { foreignKey: "participantId" });

module.exports = { Event, EventGroup, Participant, Attendance };
