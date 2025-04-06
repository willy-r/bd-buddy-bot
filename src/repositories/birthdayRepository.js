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

async function findNextBirthdaysByGuild(guildId, limit = 5) {
  try {
    const query = `
      SELECT *,
        CASE
          WHEN STRFTIME('%m-%d', birthdate) < STRFTIME('%m-%d', CURRENT_DATE)
            THEN DATE(STRFTIME('%Y', CURRENT_DATE, '+1 year') || '-' || STRFTIME('%m-%d', birthdate))
          ELSE DATE(STRFTIME('%Y', CURRENT_DATE) || '-' || STRFTIME('%m-%d', birthdate))
        END AS next_birthday
      FROM birthdays
      WHERE guild_id = :guildId
      ORDER BY next_birthday ASC
      LIMIT :limit;
    `;

    const results = await Birthday.sequelize.query(query, {
      replacements: { guildId, limit },
      model: Birthday,
      mapToModel: true,
    });

    return results;
  }
  catch (err) {
    console.error(err);
    throw new Error('Failed to get next birthdays');
  }
}

async function findByUserAndGuild(userId, guildId) {
  try {
    return await Birthday.findOne({
      where: {
        user_id: userId,
        guild_id: guildId,
      },
    });
  }
  catch (err) {
    console.error(err);
    throw new Error('Failed to get birthday by user and guild');
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
    throw new Error('Failed to update age by id');
  }
}

async function updateByUserAndGuild(userId, guildId, birthdayData) {
  try {
    return await Birthday.update(
      birthdayData,
      { where: { user_id: userId, guild_id: guildId } },
    );
  }
  catch (err) {
    console.error(err);
    throw new Error('Failed to update birthday by user and guild');
  }
}

async function deleteByUserAndGuild(userId, guildId) {
  try {
    return await Birthday.destroy({
      where: {
        user_id: userId,
        guild_id: guildId,
      },
    });
  }
  catch (err) {
    console.error(err);
    throw new Error('Failed to delete birthday by user and guild');
  }
}


module.exports = {
  createBirthday,
  findAllTodayBirthDays,
  findByUserAndGuild,
  findNextBirthdaysByGuild,
  updateAgeById,
  deleteByUserAndGuild,
  updateByUserAndGuild,
};
