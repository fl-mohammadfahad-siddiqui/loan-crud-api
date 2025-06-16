const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, rocess.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'mysql',
  logging: false, // optional
});

module.exports = sequelize;
