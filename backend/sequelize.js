const { Sequelize } = require("sequelize");
require("dotenv").config();

const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

const sequelize = dbUrl
  ? new Sequelize(dbUrl, {
      dialect: "mysql",
      logging: false,
      define: {
        timestamps: false,
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, 
        },
      },
    })
  : new Sequelize(
      process.env.DB_NAME || "attendance_app",
      process.env.DB_USER || "root",
      process.env.DB_PASS || "radu", 
      {
        host: "localhost",
        dialect: "mysql",
        logging: false,
        define: {
          timestamps: false,
        },
      }
    );

module.exports = sequelize;