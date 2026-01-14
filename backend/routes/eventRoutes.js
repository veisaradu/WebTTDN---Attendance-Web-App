const express = require("express");
const router = express.Router();
const { Event, Attendance, Participant } = require("../models");
const { Op } = require("sequelize");

// --- IN-MEMORY TIMER STORAGE ---
// Format: { eventId: timestamp }
const codeTimers = new Map();

// Helper to generate code
function generateTextCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return `EVT-${code}`;
}

// --- HELPER FUNCTION TO ROTATE CODE ---
async function checkAndRotateEvent(event) {
  if (event.status === 'OPEN') {
    const lastUpdate = codeTimers.get(event.id);
    const now = Date.now();
    const twoMinutes = 2 * 60 * 1000;

    // If timer doesn't exist (server restarted) OR > 2 minutes passed
    if (!lastUpdate || (now - lastUpdate > twoMinutes)) {
      const newCode = generateTextCode();
      
      // Update Database
      await event.update({ textCode: newCode });
      
      // Update Timer in Memory
      codeTimers.set(event.id, now);
      
      console.log(`🔄 Code rotated for Event ${event.id}: ${newCode}`);
      return true; // Code changed
    }
  }
  return false; // No change
}

// GET all events
router.get("/", async (req, res, next) => {
  try {
    // 1. Auto-close expired events
    await Event.update(
      { status: 'CLOSED' }, 
      { 
        where: { 
          status: 'OPEN',
          endTime: { [Op.lt]: new Date() } 
        } 
      }
    );

    // 2. Fetch all events
    let events = await Event.findAll({
      order: [['startTime', 'DESC']]
    });

    // 3. CHECK ROTATION FOR ALL OPEN EVENTS IN THE LIST
    // We use Promise.all to check them concurrently without slowing down too much
    await Promise.all(events.map(async (event) => {
      if (event.status === 'OPEN') {
        await checkAndRotateEvent(event);
      }
    }));

    // 4. Refetch to ensure we send the latest codes back to frontend
    // (Optimization: You could manually update the 'events' array objects, but refetch is safer)
    events = await Event.findAll({
      order: [['startTime', 'DESC']]
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
    // Initialize timer
    codeTimers.set(event.id, Date.now());
    res.status(201).location(event.id).send();
  } catch (e) {
    next(e);
  }
});

// GET single event
router.get("/:id", async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: Attendance,
          include: [{ model: Participant, attributes: ["id", "name", "email"] }],
        },
      ],
    });

    if (!event) return res.sendStatus(404);

    // Check Rotation for single event
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