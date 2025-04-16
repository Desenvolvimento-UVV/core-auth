import { type CommandInteraction, SlashCommandBuilder } from 'discord.js'
import { prisma } from '../../../database'

export default {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Change product status.')
    .addStringOption(option =>
      option
        .setName('product')
        .setDescription('Select a product')
        .setRequired(true)
        .addChoices(
          { name: 'Skript', value: 'Skript' },
          { name: 'Gosth', value: 'Gosth' },
          { name: 'Tzx', value: 'Tzx' },
          { name: 'UniTheft', value: 'UniTheft' },
          { name: 'Eulen', value: 'Eulen' }
        )
    )
    .addStringOption(option =>
      option
        .setName('status')
        .setDescription('Product status')
        .setRequired(true)
        .addChoices(
          { name: 'Online', value: 'Online' },
          { name: 'Updating', value: 'Updating' },
          { name: 'Offline', value: 'Offline' }
        )
    ),

  async execute(interaction: CommandInteraction): Promise<void> {
    try {
      const name = interaction.options.get('product')?.value as string
      const status = interaction.options.get('status')?.value as string

      const productQuery = await prisma.products.findFirst({
        where: { name }
      })

      if (!productQuery) {
        await interaction.reply({
          content: 'Product not found!',
          ephemeral: true
        })

        return
      }

      await prisma.products.update({
        where: { name },
        data: { status }
      })

      await interaction.reply({ content: 'The product status has changed!', ephemeral: true })
    } catch (e) {
      await interaction.reply({ content: 'Critical error!', ephemeral: true })
    }
  }
}
