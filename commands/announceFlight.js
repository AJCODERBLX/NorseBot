const { SlashCommandBuilder } = require('@discordjs/builders');
const { db } = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announceflight')
    .setDescription('Announce a flight to a channel')
    .addStringOption(opt => opt.setName('flight_number').setDescription('Flight number to announce').setRequired(true))
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel to announce in').setRequired(true))
    .addRoleOption(opt => opt.setName('ping_role').setDescription('Optional role to ping')),
  async execute(interaction) {
    if (!interaction.memberPermissions || !interaction.memberPermissions.has('ManageGuild')) {
      return interaction.reply({ content: 'You need Manage Server permission to announce flights.', ephemeral: true });
    }

    const flight_number = interaction.options.getString('flight_number').toUpperCase();
    const channel = interaction.options.getChannel('channel');
    const pingRole = interaction.options.getRole('ping_role');

    const flight = db.prepare('SELECT * FROM flights WHERE flight_number = ?').get(flight_number);
    if (!flight) return interaction.reply({ content: `Flight ${flight_number} not found.`, ephemeral: true });

    const embed = {
      title: `Flight ${flight.flight_number} — ${flight.origin} → ${flight.destination}`,
      description: flight.description || 'No description provided.',
      fields: [
        { name: 'Departure', value: flight.depart_time || 'TBD', inline: true },
        { name: 'Capacity', value: String(flight.capacity || 'N/A'), inline: true }
      ],
      timestamp: new Date().toISOString()
    };

    try {
      const mention = pingRole ? `<@&${pingRole.id}>` : '';
      await channel.send({ content: `${mention}`.trim(), embeds: [embed] });
      db.prepare('UPDATE flights SET announced = 1 WHERE id = ?').run(flight.id);
      return interaction.reply({ content: `Announced flight ${flight_number} in ${channel}.`, ephemeral: true });
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'Failed to send announcement. Make sure the bot has permission to send messages in the channel.', ephemeral: true });
    }
  }
};
