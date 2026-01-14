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
const eventJoinRoutes = require("./routes/eventJoinRoutes");
const exportRoutes = require("./routes/export");

const { auth, isProfessor } = require("./middleware/auth");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Attendance API running",
    version: "1.0.0",
  });
});

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
      totalEventGroups,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: error.message });
  }
});

app.use("/auth", authRoutes);
app.use("/events", auth, eventRoutes);
app.use("/event-groups", auth, isProfessor, eventGroupRoutes);
app.use("/participants", participantRoutes);
app.use("/attendance", auth, attendanceRoutes);
app.use("/event-join", auth, eventJoinRoutes);
app.use("/export", exportRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({
    error: error.message || "Internal server error",
  });
});

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced successfully!");

    app.listen(5000, () => console.log("Server running on port 5000"));
  })
  .catch((err) => {
    console.error("Database sync failed:", err);
    process.exit(1);
  });
