const { Op, Sequelize } = require('sequelize');
const Birthday = require('../models/birthday');

async function createBirthday(birthdayData) {
  try {
    return await Birthday.create(birthdayData);
  }
  catch (err) {
    console.error(err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw new Error('That birthday already exists in this server for this user');
    }
    throw new Error('Failed to create user birthday');
  }
}

async function findAllTodayBirthDays(day, month) {
  try {
    return await Birthday.findAll({
      where: Sequelize.where(
        Sequelize.cast(Sequelize.col('birthdate'), 'text'),
        { [Op.like]: `%-${month}-${day}%` },
      ),
    });
  }
  catch (err) {
    console.error(err);
    throw new Error('Failed to get all birthdays');
  }
}

async function updateAgeById(birthdayId, byAge) {
  try {
    return await Birthday.increment(
      { age: byAge },
      { where: { id: birthdayId } },
    );
  }
  catch (err) {
    console.error(err);
    throw new Error('Failed to update age by id birthday');
  }
}

module.exports = {
  createBirthday,
  findAllTodayBirthDays,
  updateAgeById,
};
