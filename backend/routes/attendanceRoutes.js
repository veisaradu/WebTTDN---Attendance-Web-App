const express = require("express");
const router = express.Router();
const { Attendance, Participant, Event } = require("../models");

router.get("/", async (req, res, next) => {
  try {
    const items = await Attendance.findAll();
    items.length ? res.json(items) : res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.body.eventId);
    const participant = await Participant.findByPk(req.body.participantId);

    if (!event || !participant) return res.sendStatus(404);

    const att = await Attendance.create(req.body);
    res.status(201).location(att.id).send();
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const att = await Attendance.findByPk(req.params.id);
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
    await att.destroy();
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
