const express = require("express");
const router = express.Router();
const { Event, Attendance, Participant } = require("../models");

router.get("/", async (req, res, next) => {
  try {
    const events = await Event.findAll();
    events.length ? res.json(events) : res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).location(event.id).send();
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: Attendance,
          include: [
            {
              model: Participant,
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });
    event ? res.json(event) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.sendStatus(404);
    await event.update(req.body);
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.sendStatus(404);
    await event.destroy();
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
