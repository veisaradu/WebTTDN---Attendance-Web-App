const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Participant = sequelize.define("Participant", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  role: { 
    type: DataTypes.ENUM('STUDENT', 'PROFESSOR', 'ADMIN'),
    defaultValue: 'STUDENT'
  },
  createdAt: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  }
});

module.exports = Participant;