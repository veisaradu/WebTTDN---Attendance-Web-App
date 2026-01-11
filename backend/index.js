const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./sequelize");
const { Event, EventGroup, Participant, Attendance } = require("./models");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const eventGroupRoutes = require("./routes/eventGroupRoutes");
const participantRoutes = require("./routes/participantRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const { auth, isProfessor } = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "Attendance API running",
    version: "1.0.0"
  });
});

// Dashboard stats (protected)
app.get("/stats", auth, async (req, res) => {
  try {
    const totalEvents = await Event.count();
    const totalParticipants = await Participant.count();
    const totalAttendance = await Attendance.count();
    const totalEventGroups = await EventGroup.count();

    res.json({
      totalEvents,
      totalParticipants,
      totalAttendance,
      totalEventGroups
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes
app.use("/auth", authRoutes);
app.use("/events", auth, eventRoutes);
app.use("/event-groups", auth, isProfessor, eventGroupRoutes);
app.use("/participants", participantRoutes);
app.use("/attendance", auth, attendanceRoutes);

// Error handling
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: error.message });
});

// FORȚEAZĂ recrearea completă a tabelelor
sequelize.sync({ force: true })
  .then(() => {
    console.log("✅ Database tables recreated successfully!");
    
    // Crează un utilizator admin de test (opțional)
    return Participant.create({
      name: "Admin",
      email: "admin@admin.test",
      password: "$2b$10$YourHashedPasswordHere", // Parola: "admin123"
      role: "ADMIN"
    });
  })
  .then(() => {
    console.log("✅ Test admin user created!");
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch(err => {
    console.error("❌ Database sync failed:", err);
    process.exit(1);
  });