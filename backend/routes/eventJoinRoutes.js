const express = require("express");
const router = express.Router();
const { Event, Attendance, Participant } = require("../models");

// Join la eveniment
router.post("/join", async (req, res) => {
  try {
    const { textCode, participantId } = req.body;
    
    if (!textCode || !participantId) {
      return res.status(400).json({ 
        error: "Text code and participant ID are required" 
      });
    }
    
    // Găsește evenimentul după cod
    const event = await Event.findOne({
      where: { textCode: textCode.toUpperCase() }
    });
    
    if (!event) {
      return res.status(404).json({ 
        error: "Invalid event code" 
      });
    }
    
    // Verifică dacă participantul există
    const participant = await Participant.findByPk(participantId);
    if (!participant) {
      return res.status(404).json({ 
        error: "Participant not found" 
      });
    }
    
    // Verifică dacă participantul este deja înscris
    const existingAttendance = await Attendance.findOne({
      where: {
        participantId,
        eventId: event.id
      }
    });
    
    if (existingAttendance) {
      return res.status(400).json({ 
        error: "You are already registered for this event" 
      });
    }
    
    // Verifică dacă evenimentul s-a terminat deja
    const now = new Date();
    const eventEnd = new Date(event.endTime);
    
    if (now > eventEnd) {
      return res.status(400).json({ 
        error: "Event has already ended" 
      });
    }
    
    // Creează înregistrarea de participare
    const attendance = await Attendance.create({
      participantId,
      eventId: event.id,
      confirmedAt: new Date(),
      status: 'PRESENT'
    });
    
    // Actualizează numărul de participanți
    const newCount = (event.currentParticipants || 0) + 1;
    const newStatus = newCount >= event.maxParticipants ? 'FULL' : event.status;
    
    await event.update({
      currentParticipants: newCount,
      status: newStatus
    });
    
    res.status(201).json({
      success: true,
      message: "Successfully joined the event",
      attendance: {
        id: attendance.id,
        participantId: attendance.participantId,
        eventId: attendance.eventId,
        confirmedAt: attendance.confirmedAt,
        status: attendance.status
      },
      event: {
        id: event.id,
        name: event.name,
        startTime: event.startTime,
        currentParticipants: newCount,
        maxParticipants: event.maxParticipants
      }
    });
    
  } catch (error) {
    console.error("Error joining event:", error);
    res.status(500).json({ 
      error: "Server error joining event" 
    });
  }
});

// Obține istoricul participărilor
router.get("/my-attendance/:participantId", async (req, res) => {
  try {
    const { participantId } = req.params;
    
    const attendance = await Attendance.findAll({
      where: { participantId },
      include: [{
        model: Event,
        attributes: ['id', 'name', 'startTime', 'eventType', 'textCode', 'description']
      }],
      order: [['confirmedAt', 'DESC']]
    });
    
    res.json(attendance || []);
    
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;