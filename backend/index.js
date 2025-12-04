const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./sequelize");
const { Event, Participant, Attendance } = require("./models");

const eventRoutes = require("./routes/eventRoutes");
const participantRoutes = require("./routes/participantRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  const events = await Event.findAll();
  res.json({ message: "Attendance API running", events });
});

app.use("/events", eventRoutes);
app.use("/participants", participantRoutes);
app.use("/attendance", attendanceRoutes);

sequelize.sync().then(() => {
  console.log("Database synced");
});

app.use((error, req, res, next) => {
  res.status(500).json(error);
});

app.listen(5000, () => console.log("Server running on port 5000"));
