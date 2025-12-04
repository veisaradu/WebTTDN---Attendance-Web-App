const Event = require("./Event");
const Participant = require("./Participant");
const Attendance = require("./Attendance");

Event.hasMany(Attendance, { foreignKey: "eventId" });
Attendance.belongsTo(Event, { foreignKey: "eventId" });

Participant.hasMany(Attendance, { foreignKey: "participantId" });
Attendance.belongsTo(Participant, { foreignKey: "participantId" });

module.exports = { Event, Participant, Attendance };
