import { SlashCommandBuilder } from "discord.js";
import { suiBotInstance } from "../..";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('stop song!'),
    async execute(interaction: any) {
        const message = suiBotInstance.stop();

        await interaction.reply(message);
    }
}