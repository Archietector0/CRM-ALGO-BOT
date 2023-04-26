import { Sequelize } from "sequelize";
import { make_image } from "./tasks.model.js";
import dotenv from 'dotenv';
dotenv.config()

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASS, {
  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT
})

const Image = make_image(sequelize)

export const db = {
  sequelize: sequelize,
  image: Image
}