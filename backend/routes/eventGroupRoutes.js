const express = require("express");
const router = express.Router();
const { EventGroup, Event } = require("../models");

// GET all groups with their events
router.get("/", async (req, res, next) => {
  try {
    const groups = await EventGroup.findAll({
      include: [{
        model: Event,

      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(groups || []);
  } catch (e) {
    console.error("Error fetching groups:", e);
    // Nu trimite next(e) dacă vrei să vezi eroarea clar în consolă, 
    // dar e bine pentru middleware-ul de erori
    res.status(500).json({ error: e.message });
  }
});

// GET single group with events
router.get("/:id", async (req, res, next) => {
  try {
    const group = await EventGroup.findByPk(req.params.id, {
      include: [{
        model: Event
      }]
    });
    group ? res.json(group) : res.sendStatus(404);
  } catch (e) {
    console.error("Error fetching group:", e);
    next(e);
  }
});

// POST create group
router.post("/", async (req, res, next) => {
  try {
    const group = await EventGroup.create(req.body);
    res.status(201).json(group);
  } catch (e) {
    console.error("Error creating group:", e);
    res.status(400).json({ error: e.message });
  }
});

// PUT update group
router.put("/:id", async (req, res, next) => {
  try {
    const group = await EventGroup.findByPk(req.params.id);
    if (!group) return res.sendStatus(404);
    await group.update(req.body);
    res.json(group);
  } catch (e) {
    console.error("Error updating group:", e);
    next(e);
  }
});

// DELETE group
router.delete("/:id", async (req, res, next) => {
  try {
    const group = await EventGroup.findByPk(req.params.id);
    if (!group) return res.sendStatus(404);
    
    // Deoarece avem onDelete: 'CASCADE' în model, evenimentele se vor șterge automat 
    // SAU vor rămâne fără grup (set null), în funcție de config.
    await group.destroy();
    res.sendStatus(204);
  } catch (e) {
    console.error("Error deleting group:", e);
    next(e);
  }
});

// ADD events to group (One-to-Many logic)
// Aici actualizăm coloana groupId a evenimentelor selectate
router.post("/:id/events", async (req, res, next) => {
  try {
    const group = await EventGroup.findByPk(req.params.id);
    if (!group) return res.status(404).json({ error: "Group not found" });
    
    const { eventIds } = req.body;
    if (!eventIds || !Array.isArray(eventIds)) {
      return res.status(400).json({ error: "eventIds array is required" });
    }
    
    // Actualizăm evenimentele pentru a aparține acestui grup
    await Event.update(
      { groupId: group.id },
      { where: { id: eventIds } }
    );
    
    // Returnăm grupul actualizat
    const updatedGroup = await EventGroup.findByPk(req.params.id, {
      include: [{ model: Event }]
    });
    
    res.json({
      message: `Added events to group`,
      group: updatedGroup
    });
  } catch (e) {
    console.error("Error adding events to group:", e);
    res.status(400).json({ error: e.message });
  }
});

// REMOVE event from group (set groupId to NULL)
router.delete("/:groupId/events/:eventId", async (req, res, next) => {
  try {
    const event = await Event.findOne({ 
      where: { 
        id: req.params.eventId,
        groupId: req.params.groupId // Ne asigurăm că aparține grupului
      }
    });

    if (!event) return res.status(404).json({ error: "Event not found in this group" });
    
    // Setăm groupId pe null (scoatem din grup)
    await event.update({ groupId: null });
    
    res.json({ message: "Event removed from group" });
  } catch (e) {
    console.error("Error removing event from group:", e);
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;