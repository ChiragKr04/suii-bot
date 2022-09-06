const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check if server is running"),
    execute: async ({ client, interaction }) => {
        return interaction.reply("SUP! Im Alive!!");
    }
};

