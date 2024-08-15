import { REST, Routes } from 'discord.js';
import { clientId, token } from './config.json';
import fs from 'node:fs';
import path from 'node:path';

// Define the type for command modules
interface Command {
	name: any;
	execute: (...args: any[]) => void;
}

const commands: object[] = [];
const commandsPath = path.join(__dirname, 'commands/general');

// Read command files from the directory
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.tsx'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command: Command = require(filePath);

	// Ensure the command has the necessary properties
	if (command.name && 'toJSON' in command.name) {
		commands.push(command.name.toJSON());
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" property or "toJSON" method.`);
	}
}

// Set up REST client for Discord API
const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// Deploy commands to Discord
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		// console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error('Failed to deploy commands:', error);
	}
})();
