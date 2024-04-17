const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Provides information about the user'),

  async execute(interaction) {
    const formattedDate = interaction.member.joinedAt.toLocaleString('pt-BR');
    await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${formattedDate}.`);
  },
};
