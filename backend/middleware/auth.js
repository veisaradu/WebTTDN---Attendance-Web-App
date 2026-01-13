const jwt = require('jsonwebtoken');
const { Participant } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'attendance-app-secret-key';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const participant = await Participant.findByPk(decoded.participantId);

    if (!participant) {
      throw new Error();
    }

    req.participant = participant;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

const isProfessor = (req, res, next) => {
  if (req.participant.role !== 'PROFESSOR' && req.participant.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Professor role required.' });
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.participant.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  next();
};

module.exports = { auth, isProfessor, isAdmin };
