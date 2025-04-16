import { type CommandInteraction, SlashCommandBuilder } from 'discord.js'
import { hash } from 'argon2'
import { prisma } from '../../../database'

export default {
  data: new SlashCommandBuilder()
    .setName('resetpassword')
    .setDescription('Change user password.')
    .addStringOption(option =>
      option.setName('username').setDescription('Username').setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('newpassword')
        .setDescription('New password')
        .setRequired(true)
    ),

  async execute(interaction: CommandInteraction): Promise<void> {
    try {
      const username = (interaction.options.get('username')?.value as string).toLowerCase()
      const password = await hash(interaction.options.get('newpassword')?.value as string)

      const userQuery = await prisma.users.findFirst({
        where: { username }
      })

      if (!userQuery) {
        await interaction.reply({
          content: 'User not found!',
          ephemeral: true
        })

        return
      }

      await prisma.users.update({
        where: { username },
        data: { password }
      })

      await interaction.reply({
        content: 'Password changed with successfully!',
        ephemeral: true
      })
    } catch (e) {
      await interaction.reply({ content: 'Critical error!', ephemeral: true })
    }
  }
}
