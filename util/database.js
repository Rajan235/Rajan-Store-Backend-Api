import Sequelize from "sequelize";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
  }
);

export default sequelize;
