import { Op, Sequelize } from 'sequelize';
import Birthday from '../models/birthday';
import type { BirthdayData } from '../types';

export async function createBirthday(birthdayData: BirthdayData): Promise<Birthday> {
  try {
    return await Birthday.create(birthdayData);
  }
  catch (err) {
    console.error(err);
    if ((err as { name?: string }).name === 'SequelizeUniqueConstraintError') {
      throw new Error('That birthday already exists in this server for this user');
    }
    throw new Error('Failed to create user birthday');
  }
}

export async function findAllTodayBirthDays(day: string, month: string): Promise<Birthday[]> {
  try {
    return await Birthday.findAll({
      where: Sequelize.where(
        Sequelize.fn('strftime', '%m-%d', Sequelize.col('birthdate')),
        Op.eq,
        `${month}-${day}`,
      ),
    });
  }
  catch (err) {
    console.error(err);
    throw new Error('Failed to get all birthdays');
  }
}

export async function findNextBirthdaysByGuild(guildId: string, limit = 5): Promise<Birthday[]> {
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

    return await Birthday.sequelize!.query(query, {
      replacements: { guildId, limit },
      model: Birthday,
      mapToModel: true,
    });
  }
  catch (err) {
    console.error(err);
    throw new Error('Failed to get next birthdays');
  }
}

export async function findByUserAndGuild(userId: string, guildId: string): Promise<Birthday | null> {
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

export async function updateAgeById(birthdayId: string, byAge: number): Promise<unknown> {
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

export async function updateByUserAndGuild(
  userId: string,
  guildId: string,
  birthdayData: Partial<BirthdayData>,
): Promise<[affectedCount: number]> {
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

export async function deleteByUserAndGuild(userId: string, guildId: string): Promise<number> {
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
