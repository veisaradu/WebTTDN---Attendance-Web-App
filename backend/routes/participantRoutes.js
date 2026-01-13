const express = require("express");
const router = express.Router();
const { Participant } = require("../models");
const { auth, isProfessor } = require("../middleware/auth");

// GET all participants (only professors)
router.get("/", auth, isProfessor, async (req, res, next) => {
  try {
    const participants = await Participant.findAll({
      attributes: { exclude: ['password'] }
    });
    participants.length ? res.json(participants) : res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

// POST create participant (register - no auth required)
router.post("/", async (req, res, next) => {
  try {
    const newP = await Participant.create(req.body);
    // Don't send password back
    const { password, ...participantWithoutPassword } = newP.toJSON();
    res.status(201).json(participantWithoutPassword);
  } catch (e) {
    next(e);
  }
});

// GET current participant profile
router.get("/profile", auth, async (req, res, next) => {
  try {
    const participant = await Participant.findByPk(req.participant.id, {
      attributes: { exclude: ['password'] }
    });
    participant ? res.json(participant) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
});

// GET single participant by ID (only professors or self)
router.get("/:id", auth, async (req, res, next) => {
  try {
    // Allow access if requesting own profile or if professor
    if (req.participant.id !== parseInt(req.params.id) && req.participant.role !== 'PROFESSOR' && req.participant.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const participant = await Participant.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    participant ? res.json(participant) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
});

// PUT update participant (only self or professor)
router.put("/:id", auth, async (req, res, next) => {
  try {
    // Allow update if own profile or if professor
    if (req.participant.id !== parseInt(req.params.id) && req.participant.role !== 'PROFESSOR' && req.participant.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const participant = await Participant.findByPk(req.params.id);
    if (!participant) return res.sendStatus(404);
    
    // Don't allow role change unless admin
    if (req.body.role && req.participant.role !== 'ADMIN') {
      delete req.body.role;
    }
    
    await participant.update(req.body);
    const { password, ...participantWithoutPassword } = participant.toJSON();
    res.json(participantWithoutPassword);
  } catch (e) {
    next(e);
  }
});

// DELETE participant (only professors/admins or self)
router.delete("/:id", auth, async (req, res, next) => {
  try {
    // Allow delete if own profile or if professor/admin
    if (req.participant.id !== parseInt(req.params.id) && req.participant.role !== 'PROFESSOR' && req.participant.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const participant = await Participant.findByPk(req.params.id);
    if (!participant) return res.sendStatus(404);
    await participant.destroy();
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

module.exports = router;