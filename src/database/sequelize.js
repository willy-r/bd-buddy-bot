const Sequelize = require('sequelize');

const storagePath = process.env.BOT_ENV === 'dev' ? 'db.dev.sqlite3' : 'db.prod.sqlite3';

module.exports = new Sequelize({
  dialect: 'sqlite',
  logging: process.env.BOT_ENV === 'dev' ? console.log : false,
  storage: storagePath,
});
