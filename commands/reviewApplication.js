const { SlashCommandBuilder } = require('@discordjs/builders');
const { db } = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reviewapplication')
    .setDescription('Review an application and DM the applicant (accept/reject)')
    .addUserOption(opt => opt.setName('user').setDescription('Applicant user').setRequired(true))
    .addStringOption(opt => opt.setName('decision').setDescription('accept or reject').addChoice('accept', 'ACCEPT').addChoice('reject', 'REJECT').setRequired(true))
    .addStringOption(opt => opt.setName('reason').setDescription('Optional reason for the decision')),
  async execute(interaction) {
    // permission check
    if (!interaction.memberPermissions || !interaction.memberPermissions.has('ManageGuild')) {
      return interaction.reply({ content: 'You need Manage Server permission to review applications.', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const decision = interaction.options.getString('decision');
    const reason = interaction.options.getString('reason') || '';

    // find most recent pending application for that user
    const app = db.prepare('SELECT a.*, f.flight_number FROM applications a LEFT JOIN flights f ON a.flight_id = f.id WHERE a.user_id = ? AND a.status = ? ORDER BY a.created_at DESC LIMIT 1').get(user.id, 'PENDING');

    if (!app) return interaction.reply({ content: `No pending application found for ${user.tag}.`, ephemeral: true });

    const newStatus = decision === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
    db.prepare('UPDATE applications SET status = ?, reviewer_id = ?, reason = ? WHERE id = ?').run(newStatus, interaction.user.id, reason, app.id);

    // DM the applicant
    const dmMessage = [
      `Hello ${app.username.split('#')[0]},`,
      `Your application ${app.flight_number ? `for flight ${app.flight_number}` : ''} has been **${newStatus}**.`,
      reason ? `Reason: ${reason}` : '',
      'If you have questions, contact the staff.'
    ].filter(Boolean).join('\n');

    try {
      await user.send(dmMessage);
      return interaction.reply({ content: `Application for ${user.tag} marked ${newStatus} and they were DM'd.`, ephemeral: true });
    } catch (err) {
      console.warn('Unable to DM applicant:', err);
      return interaction.reply({ content: `Application marked ${newStatus}, but I couldn't DM the user (privacy settings).`, ephemeral: true });
    }
  }
};
