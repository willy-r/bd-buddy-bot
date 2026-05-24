import { Sequelize } from 'sequelize';

export default new Sequelize({
  dialect: 'sqlite',
  logging: process.env.BOT_ENV === 'dev' ? console.log : false,
  storage: process.env.DATABASE_PATH,
});
