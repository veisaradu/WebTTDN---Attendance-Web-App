const express = require("express");
const router = express.Router();
const { Participant } = require("../models");

router.get("/", async (req, res, next) => {
  try {
    const users = await Participant.findAll();
    users.length ? res.json(users) : res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const newP = await Participant.create(req.body);
    res.status(201).location(newP.id).send();
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const p = await Participant.findByPk(req.params.id);
    p ? res.json(p) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const p = await Participant.findByPk(req.params.id);
    if (!p) return res.sendStatus(404);
    await p.update(req.body);
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const p = await Participant.findByPk(req.params.id);
    if (!p) return res.sendStatus(404);
    await p.destroy();
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
