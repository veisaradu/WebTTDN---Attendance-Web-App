const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "mysql",
  logging: false,
  define: {
    timestamps: false,
  },
});

module.exports = sequelize;
