const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const Participant = sequelize.define("Participant", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
});

module.exports = Participant;
