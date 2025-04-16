import { type CommandInteraction, SlashCommandBuilder } from 'discord.js'
import { prisma } from '../../../database'

export default {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Manage user ban.')
    .addStringOption(option =>
      option
        .setName('action')
        .setDescription('Select an action')
        .setRequired(true)
        .addChoices(
          { name: 'Add', value: 'Add' },
          { name: 'Remove', value: 'Remove' }
        )
    )
    .addStringOption(option =>
      option.setName('reason').setDescription('reason').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('username').setDescription('username').setRequired(true)
    ),

  async execute(interaction: CommandInteraction): Promise<void> {
    try {
      const action = interaction.options.get('action')?.value as string
      const reason = interaction.options.get('reason')?.value as string
      const username = interaction.options.get('username')?.value as string

      const userQuery = await prisma.users.findFirst({
        where: { username },
        include: { ban: true }
      })

      if (!userQuery) {
        await interaction.reply({
          content: 'User not found!',
          ephemeral: true
        })

        return
      }

      if (action === 'Add' && !userQuery.ban?.banned) {
        await prisma.bans.update({
          where: { userId: userQuery.id },
          data: { banned: true, reason }
        })

        await interaction.reply({
          content: 'User successfully banned!',
          ephemeral: true
        })

        return
      } else if (action === 'Remove' && userQuery.ban?.banned) {
        await prisma.bans.update({
          where: { userId: userQuery.id },
          data: { banned: false, reason: 'not set' }
        })

        await interaction.reply({
          content: 'Ban successfully removed!',
          ephemeral: true
        })

        return
      }

      const message = action === 'Add' ? 'This user is already banned!' : 'This user is not banned!'

      await interaction.reply({
        content: message,
        ephemeral: true
      })
    } catch (e) {
      await interaction.reply({ content: 'Critical error!', ephemeral: true })
    }
  }
}
