import { Interaction, SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!!'),
    async execute(interaction: any) {
        console.log(`Interaction: ${typeof interaction}`);
        await interaction.reply(`Pong!`);
    }
}