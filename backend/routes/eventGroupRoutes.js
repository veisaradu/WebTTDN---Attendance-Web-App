const express = require("express");
const router = express.Router();
const { EventGroup, Event } = require("../models");

router.get("/", async (req, res, next) => {
  try {
    const groups = await EventGroup.findAll();
    res.json(groups || []);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const group = await EventGroup.findByPk(req.params.id);
    group ? res.json(group) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const group = await EventGroup.create(req.body);
    res.status(201).json(group);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const group = await EventGroup.findByPk(req.params.id);
    if (!group) return res.sendStatus(404);
    await group.update(req.body);
    res.json(group);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const group = await EventGroup.findByPk(req.params.id);
    if (!group) return res.sendStatus(404);
    await group.destroy();
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

router.post("/:id/generate-events", async (req, res, next) => {
  try {
    const group = await EventGroup.findByPk(req.params.id);
    if (!group) return res.sendStatus(404);
    
    const event = await Event.create({
      groupId: group.id,
      name: group.name,
      startTime: new Date(group.startDate),
      endTime: new Date(group.startDate),
      maxParticipants: group.maxParticipants,
      description: group.description,
      eventType: group.eventType,
      status: "CLOSED",
      textCode: `EVT-${Date.now()}`,
      qrCode: `QR-${Date.now()}`
    });
    
    res.json({ 
      message: "Event created from group", 
      event 
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;