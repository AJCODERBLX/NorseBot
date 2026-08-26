const { SlashCommandBuilder } = require('@discordjs/builders');
const { db } = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createflight')
    .setDescription('Create a new flight')
    .addStringOption(opt => opt.setName('flight_number').setDescription('Flight number').setRequired(true))
    .addStringOption(opt => opt.setName('origin').setDescription('Origin airport/city').setRequired(true))
    .addStringOption(opt => opt.setName('destination').setDescription('Destination airport/city').setRequired(true))
    .addStringOption(opt => opt.setName('depart_time').setDescription('Departure time (human readable)').setRequired(true))
    .addIntegerOption(opt => opt.setName('capacity').setDescription('Passenger capacity').setRequired(true))
    .addStringOption(opt => opt.setName('description').setDescription('Optional description')),
  async execute(interaction) {
    // permission check: only server admins or those with ManageGuild can create flights
    if (!interaction.memberPermissions || !interaction.memberPermissions.has('ManageGuild')) {
      return interaction.reply({ content: 'You need Manage Server permission to create flights.', ephemeral: true });
    }

    const flight_number = interaction.options.getString('flight_number').toUpperCase();
    const origin = interaction.options.getString('origin');
    const destination = interaction.options.getString('destination');
    const depart_time = interaction.options.getString('depart_time');
    const capacity = interaction.options.getInteger('capacity');
    const description = interaction.options.getString('description') || '';

    try {
      const stmt = db.prepare(`INSERT INTO flights (flight_number, origin, destination, depart_time, capacity, description) VALUES (?, ?, ?, ?, ?, ?)`);
      stmt.run(flight_number, origin, destination, depart_time, capacity, description);
      await interaction.reply({ content: `Flight ${flight_number} created successfully.`, ephemeral: false });
    } catch (err) {
      console.error(err);
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return interaction.reply({ content: `A flight with number ${flight_number} already exists.`, ephemeral: true });
      }
      return interaction.reply({ content: 'Failed to create flight (see logs).', ephemeral: true });
    }
  }
};
