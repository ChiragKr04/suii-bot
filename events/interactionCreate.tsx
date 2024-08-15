import { Events, Interaction, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import { ExtendedClient } from '../utils/ExtendedClient';

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        // Handle autocomplete interactions
        if (interaction.isAutocomplete()) {
            const autocompleteInteraction = interaction as AutocompleteInteraction;
            // Process autocomplete interaction here
            return;
        }

        // Handle chat input commands
        if (!interaction.isChatInputCommand()) return;

        const client = interaction.client as ExtendedClient;
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            if (!interaction.replied) {
                await interaction.reply({ content: 'An error occurred while executing the command.' });
            }
            return;
        }

        try {
            // Check if interaction has been deferred or replied
            if (!interaction.replied && !interaction.deferred) {
                await command.execute(interaction);
            } else {
                console.warn('Interaction has already been acknowledged.');
            }
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
            // Ensure error handling is done correctly
            if (!interaction.replied && !interaction.deferred) {
                await (interaction as ChatInputCommandInteraction).reply({ content: 'An error occurred while executing the command.', ephemeral: true });
            }
        }
    },
};
