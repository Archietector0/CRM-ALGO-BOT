import { Sequelize } from "sequelize";

export function make_image (sequelize) {
  return sequelize.define(process.env.DB_TABLE_NAME, {
    uuid: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false
    },
    header: {
      type: Sequelize.STRING,
      allowNull: false
    },
    project_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    assignee: {
      type: Sequelize.STRING,
      allowNull: false
    },
    assignee_to: {
      type: Sequelize.STRING,
      allowNull: false
    },
    priority: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.STRING,
      allowNull: false
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false
    }
  }, {
    timestamps: false,
    tableName: process.env.DB_TABLE_NAME
  })
}