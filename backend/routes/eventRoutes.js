const express = require("express");
const router = express.Router();
const { Event, Attendance, Participant } = require("../models");
const { Op } = require("sequelize");

const codeTimers = new Map();

function generateTextCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++)
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  return `EVT-${code}`;
}

async function checkAndRotateEvent(event) {
  if (event.status === "OPEN") {
    const lastUpdate = codeTimers.get(event.id);
    const now = Date.now();
    const twoMinutes = 2 * 60 * 1000;

    if (!lastUpdate || now - lastUpdate > twoMinutes) {
      const newCode = generateTextCode();

      await event.update({ textCode: newCode });

      codeTimers.set(event.id, now);

      console.log(`Code rotated for Event ${event.id}: ${newCode}`);
      return true;
    }
  }
  return false;
}

router.get("/", async (req, res, next) => {
  try {
    await Event.update(
      { status: "CLOSED" },
      {
        where: {
          status: "OPEN",
          endTime: { [Op.lt]: new Date() },
        },
      }
    );

    let events = await Event.findAll({
      order: [["startTime", "DESC"]],
    });

    await Promise.all(
      events.map(async (event) => {
        if (event.status === "OPEN") {
          await checkAndRotateEvent(event);
        }
      })
    );

    events = await Event.findAll({
      order: [["startTime", "DESC"]],
    });

    res.json(events || []);
  } catch (e) {
    console.error("Error fetching events:", e);
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const event = await Event.create(req.body);

    codeTimers.set(event.id, Date.now());
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
            { model: Participant, attributes: ["id", "name", "email"] },
          ],
        },
      ],
    });

    if (!event) return res.sendStatus(404);

    await checkAndRotateEvent(event);

    res.json(event);
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
    codeTimers.delete(event.id);
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
