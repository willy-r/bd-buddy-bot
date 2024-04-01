const Sequelize = require('sequelize');

module.exports = new Sequelize({
  dialect: 'sqlite',
  logging: false,
  storage: 'db.sqlite3',
});
