

/**
 * Module for feedback model
 * @module models/feedback
 */

const Sequelize = require('sequelize');

const util = require('../services/util.es6');

module.exports = util.getSequelizeConnection().define(
  'nrmService',
  {
    message: { type: Sequelize.STRING, field: 'message' },
    createdAt: {
      type: Sequelize.DATE, defaultValue: Sequelize.NOW, allowNull: false, field: 'created'
    },
    updatedAt: {
      type: Sequelize.DATE, defaultValue: Sequelize.NOW, allowNull: false, field: 'updated'
    }
  },
  {
    timestamps: true
  }
);
