const Event = require("./Event");
const EventGroup = require("./EventGroup");
const Participant = require("./Participant");
const Attendance = require("./Attendance");

// Asocieri SIMPLE și corecte
Event.hasMany(Attendance, { foreignKey: "eventId", onDelete: 'CASCADE' });
Attendance.belongsTo(Event, { foreignKey: "eventId" });

Participant.hasMany(Attendance, { foreignKey: "participantId", onDelete: 'CASCADE' });
Attendance.belongsTo(Participant, { foreignKey: "participantId" });

// Pentru EventGroups (dacă folosești)
EventGroup.hasMany(Event, { foreignKey: "groupId", onDelete: 'CASCADE' });
Event.belongsTo(EventGroup, { foreignKey: "groupId" });

module.exports = { 
  Event, 
  EventGroup, 
  Participant, 
  Attendance 
};