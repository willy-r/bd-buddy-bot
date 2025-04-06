const { SlashCommandBuilder } = require('discord.js');

const { createBirthday } = require('../../repositories/birthdayRepository');
const { birthdaySchema } = require('../../validators/birthday');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Adiciona seu aniversário à memória do Buddy!')
    .addStringOption((option) =>
      option.setName('birthdate')
        .setDescription('Data no formato "DD/MM" ou "DD/MM/AAAA"')
        .setRequired(true))
    .addBooleanOption((option) =>
      option.setName('show-age')
        .setDescription('O Buddy deve mostrar sua idade? Padrão é falso')),

  async execute(interaction) {
    const hasBirthdayRole = interaction.member.roles.cache.some((role) =>
      process.env.BIRTHDAY_GUILDS_ROLES.split(',').includes(role.id),
    );
    if (!hasBirthdayRole) {
      await interaction.reply('Desculpe, você não tem permissão para usar esse comando 😿');
      return;
    }

    const birthdateInput = interaction.options.getString('birthdate');
    const parseResult = birthdaySchema.safeParse(birthdateInput);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors[0]?.message || 'Data inválida';
      await interaction.reply(`${errorMsg} 😿`);
      return;
    }

    const showAge = interaction.options.getBoolean('show-age') ?? false;
    const { parsedDate, isFullDate } = parseResult.data;
    if (showAge && !isFullDate) {
      await interaction.reply('Ops! Para mostrar sua idade, precisamos que você informe o ano de nascimento 🐱');
      return;
    }

    const { id: userId, username } = interaction.user;
    const { id: guildId, name: guildName } = interaction.guild;

    const birthdayData = {
      user_id: userId,
      guild_id: guildId,
      guild_name: guildName,
      show_age: showAge,
      birthdate: parsedDate,
      username,
    };

    try {
      await createBirthday(birthdayData);
      await interaction.reply('Seu aniversário foi adicionado com sucesso! 🎉😻');
    }
    catch (err) {
      let message = 'Falha ao adicionar seu aniversário 😿';
      if (err.message.includes('already exists')) {
        message = 'Parece que seu aniversário já está registrado aqui! 😺';
      }
      await interaction.reply(message);
    }
  },
};
