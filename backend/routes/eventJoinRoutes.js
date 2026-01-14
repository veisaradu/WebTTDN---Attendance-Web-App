const express = require("express");
const router = express.Router();
const { Event, Participant, Attendance } = require("../models");
const { Op } = require("sequelize");

// POST /event-join/join
router.post("/join", async (req, res) => {
  try {
    const { textCode, participantId } = req.body;

    console.log(`[Join Attempt] Code: ${textCode}, StudentID: ${participantId}`);

    // 1. Validate Input
    if (!textCode || !participantId) {
      console.log("❌ Missing fields");
      return res.status(400).json({ error: "Missing code or student ID" });
    }

    // 2. Find the Event by Code
    const event = await Event.findOne({ 
      where: { textCode: textCode } 
    });

    if (!event) {
      console.log("❌ Event not found for code:", textCode);
      return res.status(404).json({ error: "Invalid event code" });
    }

    // 3. Check if Event is OPEN
    // We also double-check the time just in case the status hasn't auto-updated yet
    const now = new Date();
    if (event.status !== 'OPEN' || new Date(event.endTime) < now) {
      console.log("❌ Event is closed or expired");
      return res.status(400).json({ error: "This event is closed" });
    }

    // 4. Check if Student Exists
    const student = await Participant.findByPk(participantId);
    if (!student) {
      console.log("❌ Student not found ID:", participantId);
      return res.status(404).json({ error: "Student account not found" });
    }

    // 5. Check if Already Joined
    const existingAttendance = await Attendance.findOne({
      where: {
        eventId: event.id,
        participantId: student.id
      }
    });

    if (existingAttendance) {
      console.log("⚠️ Already joined");
      return res.status(400).json({ error: "You have already joined this event" });
    }

    // 6. Register Attendance
    // We capture the IP if available (x-forwarded-for is for proxies like Render/Heroku)
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const newAttendance = await Attendance.create({
      eventId: event.id,
      participantId: student.id,
      status: 'PRESENT',
      confirmedAt: new Date(),
      ipAddress: ipAddress
    });

    // 7. Increment Participant Count in Event Table (Optional, but good for performance)
    await event.increment('currentParticipants');

    console.log(`✅ Success! User ${student.name} joined Event ${event.name}`);
    
    res.status(200).json({ 
      message: "Joined successfully", 
      event: {
        id: event.id,
        name: event.name,
        startTime: event.startTime
      }
    });

  } catch (error) {
    console.error("❌ SERVER ERROR in /join:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /event-join/my-attendance/:studentId
router.get("/my-attendance/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const history = await Attendance.findAll({
      where: { participantId: studentId },
      include: [{
        model: Event,
        attributes: ['id', 'name', 'textCode', 'startTime', 'endTime', 'eventType', 'status']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(history);
  } catch (error) {
    console.error("Error fetching student history:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;