import { type CommandInteraction, SlashCommandBuilder } from 'discord.js'
import { randomBytes } from 'crypto'
import { prisma } from '../../../database'

export default {
  data: new SlashCommandBuilder()
    .setName('generate')
    .setDescription('Generates a user key.')
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
        .setName('expire')
        .setDescription('Select an expiration time')
        .setRequired(true)
        .addChoices(
          { name: '30 Days', value: '30' },
          { name: '60 Days', value: '60' },
          { name: '90 Days', value: '90' },
          { name: 'Lifetime', value: '3600' }
        )
    ),

  async execute(interaction: CommandInteraction): Promise<void> {
    try {
      const productName = interaction.options.get('product')?.value as string
      const productTime = parseInt(interaction.options.get('expire')?.value as string)
      const productKey = randomBytes(16).toString('hex')

      const productQuery = await prisma.products.findFirst({
        where: { name: productName }
      })

      if (!productQuery) {
        await interaction.reply({
          content: 'Product not found!',
          ephemeral: true
        })

        return
      }

      await prisma.keys.create({
        data: {
          ownerId: interaction.user.id,
          productKey,
          productId: productQuery.id,
          productTime
        }
      })

      await interaction.reply({ content: productKey, ephemeral: true })
    } catch (e) {
      await interaction.reply({ content: 'Critical error!', ephemeral: true })
    }
  }
}
