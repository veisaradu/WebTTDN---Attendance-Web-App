const express = require("express");
const router = express.Router();
const { Event, EventGroup, Attendance, Participant } = require("../models");
const { Parser } = require('json2csv');
const { auth, isProfessor } = require("../middleware/auth");

// Export pentru un singur eveniment
router.get("/event/:id", auth, isProfessor, async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findByPk(eventId);
    if (!event) return res.sendStatus(404);

    const attendances = await Attendance.findAll({
      where: { eventId },
      include: [{ model: Participant, attributes: ['name', 'email'] }]
    });

    if (attendances.length === 0) return res.status(400).json({ message: "No attendance records" });

    const fields = ['Participant.name', 'Participant.email', 'status', 'confirmedAt', 'ipAddress'];
    const data = attendances.map(att => ({
      "Participant.name": att.Participant ? att.Participant.name : 'Unknown',
      "Participant.email": att.Participant ? att.Participant.email : 'Unknown',
      "status": att.status,
      "confirmedAt": att.confirmedAt ? new Date(att.confirmedAt).toLocaleString() : '',
      "ipAddress": att.ipAddress
    }));

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(`attendance-event-${eventId}.csv`);
    res.send(csv);

  } catch (e) {
    next(e);
  }
});

// Export pentru un grup de evenimente
router.get("/group/:id", auth, isProfessor, async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const group = await EventGroup.findByPk(groupId);
    if (!group) return res.sendStatus(404);

    const events = await Event.findAll({ where: { groupId } });
    if (events.length === 0) return res.status(400).json({ message: "No events in this group" });

    const eventIds = events.map(e => e.id);

    const attendances = await Attendance.findAll({
      where: { eventId: eventIds },
      include: [
        { model: Participant, attributes: ['name', 'email'] },
        { model: Event, attributes: ['name'] }
      ]
    });

    if (attendances.length === 0) return res.status(400).json({ message: "No attendance records" });

    const fields = ['Event.name', 'Participant.name', 'Participant.email', 'status', 'confirmedAt', 'ipAddress'];
    const data = attendances.map(att => ({
      "Event.name": att.Event ? att.Event.name : 'Unknown Event',
      "Participant.name": att.Participant ? att.Participant.name : 'Unknown',
      "Participant.email": att.Participant ? att.Participant.email : 'Unknown',
      "status": att.status,
      "confirmedAt": att.confirmedAt ? new Date(att.confirmedAt).toLocaleString() : '',
      "ipAddress": att.ipAddress
    }));

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(`attendance-group-${groupId}.csv`);
    res.send(csv);

  } catch (e) {
    next(e);
  }
});

module.exports = router;
