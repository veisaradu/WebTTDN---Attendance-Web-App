const express = require("express");
const router = express.Router();
const { Participant } = require("../models");
const { auth, isProfessor } = require("../middleware/auth");

router.get("/", auth, isProfessor, async (req, res, next) => {
  try {
    const participants = await Participant.findAll({
      attributes: { exclude: ["password"] },
    });
    participants.length ? res.json(participants) : res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

router.get("/students", auth, isProfessor, async (req, res, next) => {
  try {
    const students = await Participant.findAll({
      where: { role: "STUDENT" },
      attributes: { exclude: ["password"] },
    });

    students.length ? res.json(students) : res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const newP = await Participant.create(req.body);

    const { password, ...participantWithoutPassword } = newP.toJSON();
    res.status(201).json(participantWithoutPassword);
  } catch (e) {
    next(e);
  }
});

router.get("/profile", auth, async (req, res, next) => {
  try {
    const participant = await Participant.findByPk(req.participant.id, {
      attributes: { exclude: ["password"] },
    });
    participant ? res.json(participant) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", auth, async (req, res, next) => {
  try {
    if (
      req.participant.id !== parseInt(req.params.id) &&
      req.participant.role !== "PROFESSOR" &&
      req.participant.role !== "ADMIN"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    const participant = await Participant.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });
    participant ? res.json(participant) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", auth, async (req, res, next) => {
  try {
    if (
      req.participant.id !== parseInt(req.params.id) &&
      req.participant.role !== "PROFESSOR" &&
      req.participant.role !== "ADMIN"
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    const participant = await Participant.findByPk(req.params.id);
    if (!participant) return res.sendStatus(404);

    if (req.body.role && req.participant.role !== "ADMIN") {
      delete req.body.role;
    }

    await participant.update(req.body);
    const { password, ...participantWithoutPassword } = participant.toJSON();
    res.json(participantWithoutPassword);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  try {
    if (
      req.participant.id !== parseInt(req.params.id) &&
      req.participant.role !== "PROFESSOR" &&
      req.participant.role !== "ADMIN"
    ) {
      return res.status(403).json({ error: "Access denied" });
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
