const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Participant } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "attendance-app-secret-key";

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingParticipant = await Participant.findOne({ where: { email } });
    if (existingParticipant) {
      return res.status(400).json({ error: "Email already registered" });
    }

    let role = "STUDENT";

    const professorPattern = /@prof(?:essor)?\./i;
    const adminPattern = /@admin\./i;

    if (adminPattern.test(email)) {
      role = "ADMIN";
    } else if (professorPattern.test(email)) {
      role = "PROFESSOR";
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const participant = await Participant.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign(
      {
        participantId: participant.id,
        email: participant.email,
        role: participant.role,
        name: participant.name,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      participant: {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        role: participant.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const participant = await Participant.findOne({ where: { email } });
    if (!participant) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      participant.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        participantId: participant.id,
        email: participant.email,
        role: participant.role,
        name: participant.name,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      participant: {
        id: participant.id,
        name: participant.name,
        email: participant.email,
        role: participant.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const participant = await Participant.findByPk(decoded.participantId, {
      attributes: { exclude: ["password"] },
    });

    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    res.json({ participant });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
