const { SlashCommandBuilder } = require('@discordjs/builders');
const { db } = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('apply')
    .setDescription('Apply to a flight/your airline (creates an application)')
    .addStringOption(opt => opt.setName('flight_number').setDescription('Flight number you are applying for').setRequired(false))
    .addStringOption(opt => opt.setName('experience').setDescription('Tell us about your experience').setRequired(false)),
  async execute(interaction) {
    const flight_number = interaction.options.getString('flight_number');
    const experience = interaction.options.getString('experience') || '';

    let flight = null;
    if (flight_number) {
      flight = db.prepare('SELECT * FROM flights WHERE flight_number = ?').get(flight_number.toUpperCase());
      if (!flight) {
        return interaction.reply({ content: `Flight ${flight_number} not found. Omit flight_number to apply to the airline generally.`, ephemeral: true });
      }
    }

    const insert = db.prepare('INSERT INTO applications (user_id, username, flight_id, experience) VALUES (?, ?, ?, ?)');
    insert.run(interaction.user.id, `${interaction.user.username}#${interaction.user.discriminator}`, flight ? flight.id : null, experience);

    // confirm by DM if possible
    try {
      await interaction.user.send(`Thanks — your application has been received${flight ? ` for flight ${flight.flight_number}` : ''}. A staff member will review it and DM you.`);
      await interaction.reply({ content: 'Application submitted. Check your DMs for confirmation.', ephemeral: true });
    } catch (err) {
      // can't DM: fall back to ephemeral reply
      console.warn('Unable to DM user:', err);
      await interaction.reply({ content: 'Application submitted, but I couldn\'t DM you (check privacy settings).', ephemeral: true });
    }
  }
};
