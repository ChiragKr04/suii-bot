import { CommandInteraction, SlashCommandBuilder, GuildMember } from "discord.js";
import { suiBotInstance } from "../../index";
// @ts-ignore
import * as YouTubeSearchApi from "youtube-search-api";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song')
        .addStringOption(option =>
            option.setName('song')
                .setDescription('The song to play')
                .setRequired(true)),
    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        try {
            const member = interaction.member as GuildMember;
            const voiceChannel = member.voice.channel;

            if (!voiceChannel) {
                await interaction.editReply('You need to be in a voice channel to play music!');
                return;
            }

            // Get the search query or song name
            const songQuery = interaction.options.data[0].value?.toString() || '';

            // Search for the song on YouTube
            const searchResult = await YouTubeSearchApi.GetListByKeyword(songQuery, false, 1);

            if (!searchResult.items.length) {
                await interaction.editReply('No results found for your query.');
                return;
            }

            // Get the first result's video URL
            const videoUrl = `https://www.youtube.com/watch?v=${searchResult.items[0].id}`;

            // Play the song using your bot instance
            const message = await suiBotInstance.play(videoUrl, voiceChannel, interaction.channel);

            await interaction.editReply(message || 'Playing your song!');
        } catch (error) {
            console.error(error);
            await interaction.editReply('An internal error occurred.');
        }
    },
};
