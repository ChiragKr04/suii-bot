require('dotenv').config();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const { Client, IntentsBitField, Collection, GatewayIntentBits } = require('discord.js');
const { Player } = require("discord-player")
const { QueryType } = require("discord-player")



const fs = require('fs');
const path = require('path');


const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// List of all commands
const commands = [];
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

// Add the player on the client
client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
})

client.on("ready", () => {
    const guild_ids = client.guilds.cache.map(guild => guild.id);
    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
    for (const guildId of guild_ids) {
        rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
            { body: commands })
            .then(() => console.log('Successfully updated commands for guild ' + guildId))
            .catch(console.error);
    }
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute({ client, interaction });
    }
    catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error executing this command" });
    }
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return false;

    console.log();

    if (message.content === "sarkar") {
        playAudioWithUrl(message, "https://www.youtube.com/watch?v=tOECoEeoqWI");
        message.channel.send("Lawde ka sarkar!");
    }

    if (message.content === "suii") {
        playAudioWithUrl(message, "https://www.youtube.com/watch?v=1ITn6T9Hmm4&ab_channel=YassineChak");
        message.channel.send("SUUIIIIIIIIIIIIIIIIIIII");
    }

    if (message.content === "umkf") {
        playAudioWithUrl(message, "https://www.youtube.com/watch?v=SGPrOEZJPTQ&ab_channel=GameBugKnight");
        message.channel.send("USSE MERA KYA FAYEDA!!?");
    }

    if (message.content === "achya") {
        playAudioWithUrl(message, "https://www.youtube.com/shorts/L5GTkos3A-4");
        message.channel.send("ACHYAAA!!");
    }
    else {
        message.channel.send("BHAI! " + message.author.username + " kuch bola!");
    }


    console.log(`Message from ${message.author.username}: ${message.content}`);
});

async function playAudioWithUrl(message, url) {
    const queue = await client.player.createQueue(message.guild);

    if (!queue.connection) await queue.connect(message.member.voice.channel);

    const result = await client.player.search(url, {
        requestedBy: message.username,
        searchEngine: QueryType.YOUTUBE_VIDEO
    })

    if (result.tracks.length === 0)
        return message.reply("No results");

    const song = result.tracks[0];
    await queue.addTrack(song);
    await queue.play();
}

client.login(process.env.TOKEN);

