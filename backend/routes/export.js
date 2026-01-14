const express = require("express");
const router = express.Router();
const { Event, EventGroup, Attendance, Participant } = require("../models");
const { Parser } = require('json2csv');
const { auth, isProfessor } = require("../middleware/auth");

// Export Single Event Data
router.get("/event/:id", auth, isProfessor, async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findByPk(eventId);
    if (!event) return res.sendStatus(404);

    const attendances = await Attendance.findAll({
      where: { eventId },
      include: [{ model: Participant, attributes: ['name', 'email'] }]
    });

    const fields = [
      'Event Name', 
      'Start Time', 
      'End Time', 
      'Participant Name', 
      'Participant Email', 
      'Status', 
      'Time Joined'
    ];
    
    // If participants exist, map them. If not, show one row with event details and "No participants"
    const data = attendances.length > 0 ? attendances.map(att => ({
      "Event Name": event.name,
      "Start Time": new Date(event.startTime).toLocaleString(),
      "End Time": new Date(event.endTime).toLocaleString(),
      "Participant Name": att.Participant ? att.Participant.name : 'Unknown',
      "Participant Email": att.Participant ? att.Participant.email : 'Unknown',
      "Status": att.status,
      "Time Joined": att.confirmedAt ? new Date(att.confirmedAt).toLocaleString() : ''
    })) : [{
        "Event Name": event.name,
        "Start Time": new Date(event.startTime).toLocaleString(),
        "End Time": new Date(event.endTime).toLocaleString(),
        "Participant Name": "No participants",
        "Participant Email": "-",
        "Status": "-",
        "Time Joined": "-"
    }];

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(`attendance-event-${eventId}.csv`);
    res.send(csv);

  } catch (e) {
    console.error("Export Event Error:", e);
    next(e);
  }
});

// Export Event Group Data (Improved Logic)
router.get("/group/:id", auth, isProfessor, async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const group = await EventGroup.findByPk(groupId);
    if (!group) return res.sendStatus(404);

    // 1. Get all events in the group
    const events = await Event.findAll({ where: { groupId } });
    
    if (events.length === 0) {
       // Return CSV saying group is empty
       const parser = new Parser({ fields: ['Group Name', 'Message'] });
       const csv = parser.parse([{ "Group Name": group.name, "Message": "No events in this group" }]);
       res.header('Content-Type', 'text/csv');
       res.attachment(`attendance-group-${groupId}.csv`);
       return res.send(csv);
    }

    const finalData = [];

    // 2. Iterate over EVERY event to ensure it appears in CSV even if empty
    for (const event of events) {
        const attendances = await Attendance.findAll({
            where: { eventId: event.id },
            include: [{ model: Participant, attributes: ['name', 'email'] }]
        });

        if (attendances.length > 0) {
            // Add a row for each participant
            attendances.forEach(att => {
                finalData.push({
                    "Group Name": group.name,
                    "Event Name": event.name,
                    "Event Date": new Date(event.startTime).toLocaleDateString(),
                    "Participant Name": att.Participant ? att.Participant.name : 'Unknown',
                    "Participant Email": att.Participant ? att.Participant.email : 'Unknown',
                    "Status": att.status,
                    "Time Joined": att.confirmedAt ? new Date(att.confirmedAt).toLocaleString() : ''
                });
            });
        } else {
            // Add a SINGLE row for the event indicating no participants
            finalData.push({
                "Group Name": group.name,
                "Event Name": event.name,
                "Event Date": new Date(event.startTime).toLocaleDateString(),
                "Participant Name": "No participants",
                "Participant Email": "-",
                "Status": "-",
                "Time Joined": "-"
            });
        }
    }

    const fields = [
        'Group Name',
        'Event Name', 
        'Event Date',
        'Participant Name', 
        'Participant Email', 
        'Status', 
        'Time Joined'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(finalData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`attendance-group-${groupId}.csv`);
    res.send(csv);

  } catch (e) {
    console.error("Export Group Error:", e);
    next(e);
  }
});

module.exports = router;