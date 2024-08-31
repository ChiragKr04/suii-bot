import { Client, Collection, GatewayIntentBits } from "discord.js";
import { SuiBot } from "./utils/SuiBot";
require('dotenv').config();

export const TOKEN: string = process.env.TOKEN ?? '';
export const CLIENTID: string = process.env.CLIENTID ?? '';

import path from 'node:path';
import fs from 'node:fs';
import { ExtendedClient } from "./utils/ExtendedClient";

const suiBot = new SuiBot();
export const suiBotInstance = suiBot;

suiBot.initialize();

const client: ExtendedClient = new Client({
    intents: [
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
}) as ExtendedClient;

client.commands = new Collection();

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.tsx'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

const commandsPath = path.join(__dirname, 'commands/general');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.tsx'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection
    client.commands.set(command.data.name, command);
}


client.login(TOKEN);
