const express = require("express");
const router = express.Router();
const { Attendance, Participant, Event } = require("../models");
const { isProfessor } = require("../middleware/auth");
router.get("/", async (req, res, next) => {
  try {
    const items = await Attendance.findAll({
      include: [
        {
          model: Event,
          attributes: ["name", "startTime"],
        },
      ],
    });
    items.length ? res.json(items) : res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

router.get("/professor-history", isProfessor, async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [["startTime", "DESC"]],
      include: [
        {
          model: Attendance,
          include: [
            {
              model: Participant,
              attributes: ["name", "email", "id"],
            },
          ],
        },
      ],
    });
    res.json(events);
  } catch (error) {
    console.error("Error fetching professor history:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { eventId, participantId } = req.body;
    const event = await Event.findByPk(eventId);
    const participant = await Participant.findByPk(participantId);

    if (!event || !participant)
      return res
        .status(404)
        .json({ error: "Event sau Participant inexistent" });

    const existing = await Attendance.findOne({
      where: { eventId, participantId },
    });
    if (existing)
      return res
        .status(400)
        .json({ error: "Studentul este deja înregistrat la acest eveniment" });

    const att = await Attendance.create(req.body);

    await event.increment("currentParticipants");

    res.status(201).json(att);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const att = await Attendance.findByPk(req.params.id, {
      include: [
        {
          model: Event,
          attributes: ["name", "startTime"],
        },
      ],
    });
    att ? res.json(att) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const att = await Attendance.findByPk(req.params.id);
    if (!att) return res.sendStatus(404);
    await att.update(req.body);
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const att = await Attendance.findByPk(req.params.id);
    if (!att) return res.sendStatus(404);

    const event = await Event.findByPk(att.eventId);

    await att.destroy();

    if (event && event.currentParticipants > 0) {
      await event.decrement("currentParticipants");
    }

    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
