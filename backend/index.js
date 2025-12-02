const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient(); // no adapter

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  const events = await prisma.event.findMany();
  res.json({ message: "Attendance API running", events });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
