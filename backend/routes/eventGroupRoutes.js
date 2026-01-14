const express = require("express");
const router = express.Router();
const { EventGroup, Event } = require("../models");

// GET all groups with their events
router.get("/", async (req, res) => {
  try {
    const groups = await EventGroup.findAll({
      include: [{ model: Event, as: 'Events' }], // match alias in models
      order: [['createdAt', 'DESC']]
    });
    res.json(groups || []);
  } catch (e) {
    console.error("Error fetching groups:", e);
    res.status(500).json({ error: e.message });
  }
});

// GET single group with events
router.get("/:id", async (req, res) => {
  try {
    const group = await EventGroup.findByPk(req.params.id, {
      include: [{ model: Event, as: 'Events' }]
    });
    if (!group) return res.sendStatus(404);
    res.json(group);
  } catch (e) {
    console.error("Error fetching group:", e);
    res.status(500).json({ error: e.message });
  }
});

// POST create group
router.post("/", async (req, res) => {
  try {
    const group = await EventGroup.create(req.body);
    res.status(201).json(group);
  } catch (e) {
    console.error("Error creating group:", e);
    res.status(400).json({ error: e.message });
  }
});

// ADD events to group
router.post("/:id/events", async (req, res) => {
  try {
    const group = await EventGroup.findByPk(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const { eventIds } = req.body;
    if (!eventIds || !Array.isArray(eventIds)) {
      return res.status(400).json({ error: "eventIds array is required" });
    }

    await Event.update(
      { groupId: group.id },
      { where: { id: eventIds } }
    );

    const updatedGroup = await EventGroup.findByPk(req.params.id, {
      include: [{ model: Event, as: 'Events' }]
    });
    res.json({ message: `Added events to group`, group: updatedGroup });
  } catch (e) {
    console.error("Error adding events to group:", e);
    res.status(400).json({ error: e.message });
  }
});

// REMOVE event from group
router.delete("/:groupId/events/:eventId", async (req, res) => {
  try {
    const event = await Event.findOne({ 
      where: { id: req.params.eventId, groupId: req.params.groupId }
    });

    if (!event) return res.status(404).json({ error: "Event not found in this group" });

    await event.update({ groupId: null });
    res.json({ message: "Event removed from group" });
  } catch (e) {
    console.error("Error removing event from group:", e);
    res.status(400).json({ error: e.message });
  }
});

// DELETE group
router.delete("/:id", async (req, res) => {
  try {
    const group = await EventGroup.findByPk(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    await group.destroy();
    res.json({ message: "Group deleted" });
  } catch (e) {
    console.error("Error deleting group:", e);
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
