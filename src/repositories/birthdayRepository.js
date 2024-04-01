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

module.exports = {
  createBirthday,
};
