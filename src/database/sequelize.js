const Sequelize = require('sequelize');

module.exports = new Sequelize({
  dialect: 'sqlite',
  logging: true,
  storage: 'db.sqlite3',
});
