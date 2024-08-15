import { AudioPlayerStatus, AudioResource, createAudioResource, joinVoiceChannel, StreamType, VoiceConnectionStatus } from "@discordjs/voice";
import { MusicPlayer, MusicPlayerState } from "./MusicPlayer";
import { Queue } from "./Queue";
import { Validator } from "./Validator";
import ytdl from '@distube/ytdl-core';
import ytpl from "@distube/ytpl";
import { VoiceBasedChannel } from "discord.js";

export class SuiBot {
    musicPlayer: MusicPlayer = new MusicPlayer();
    queue: Queue = new Queue();
    validator: Validator = new Validator();
    currentChannel: any;
    currentConnection: any;

    constructor() { }

    initialize() {
        this.musicPlayer.getPlayer().on(AudioPlayerStatus.Idle, () => {
            const nextResource = this.queue.getNext();
            if (nextResource) {
                this.musicPlayer.play(nextResource);
                this.currentChannel.send('Now playing: ' + nextResource.metadata);
            }
        })
    }

    async generateAudioResource(link: string) {
        const info = await ytdl.getBasicInfo(link);
        const title = info.videoDetails.title;

        const stream = ytdl(link, {
            filter: 'audioonly',
            quality: 'highest',
            dlChunkSize: 0
        });

        const resource = createAudioResource(stream, {
            inputType: StreamType.Arbitrary,
            metadata: {
                title: title
            }
        });

        resource.playStream.on('error', error => {
            console.error(`resource:`);
            console.error(error);
        });

        return resource;
    }

    connect(voiceChannel: VoiceBasedChannel) {
        this.currentConnection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: false,
        });

        this.currentConnection.on(VoiceConnectionStatus.Connecting, () => {
            console.log('Connecting...');
        });

        this.currentConnection.on(VoiceConnectionStatus.Ready, () => {
            console.log('Connecton is ready');
        });

        this.currentConnection.on(VoiceConnectionStatus.Destroyed, () => {
            console.log('Destroyed');
        });

        this.currentConnection.on(VoiceConnectionStatus.Signalling, () => {
            console.log('Connection is in Signalling state');
        });

        this.currentConnection.on(VoiceConnectionStatus.Disconnected, () => {
            console.log('Disconnected');
            this.currentConnection.destroy();
            this.currentConnection = null;
        });

        const subscription = this.currentConnection.subscribe(this.musicPlayer.getPlayer());

        if (subscription) {
            console.log('subscribed!');
        }
    }

    async play(link: string, voiceChannel: VoiceBasedChannel, textChannel: any) {
        if (this.validator.validateYoutubeLink(link) === false) {
            return 'Invalid link';
        }
        else {
            this.currentChannel = textChannel;

            if (voiceChannel === null) {
                return 'You should be in the voice channel!';
            }

            const message = await this.addToQueue(link, voiceChannel, 'start');

            return message + '\n' + this.next(voiceChannel);
        }
    }

    next(voiceChannel: VoiceBasedChannel) {
        const resource: AudioResource<{ title: string; }> | any = this.queue.getNext();

        if (resource) {
            if (this.currentConnection) {
                this.musicPlayer.stop();
                this.musicPlayer.play(resource);
            }
            else {
                this.connect(voiceChannel);
                this.musicPlayer.play(resource);
            }
            return 'Now playing: ' + resource.metadata.title;
        }
        else {
            return 'Queue is empty';
        }
    }
    pause() {
        if (this.musicPlayer.pause()) {
            return 'Paused';
        }
        else {
            return 'Cannot pause';
        }
    }

    async addToQueue(link: string, voiceChannel: VoiceBasedChannel, addType = 'end') {
        if (this.validator.validateYoutubeLink(link) === false) {
            return 'Invalid link';
        }
        else {
            if (link.includes('&list')) {
                const playlist = await ytpl(link, { limit: 15 });
                const playlistQueue = []

                for (let index = 0; index < playlist.items.length; index++) {
                    const resource = await this.generateAudioResource(playlist.items[index].url);

                    playlistQueue.push(resource);

                    const message = 'Added to queue: ' + resource.metadata.title;

                    console.log(message);
                }

                if (addType == "start") {
                    this.queue.addArrayToStart(playlistQueue);
                } else {
                    this.queue.addArrayToEnd(playlistQueue)
                }

                if (this.musicPlayer.getCurrentState() != MusicPlayerState.Error &&
                    this.musicPlayer.getCurrentState() != MusicPlayerState.Playing) {
                    return 'Queued ' + playlist.items.length + ' songs' + '\n' + this.next(voiceChannel);
                }

                return 'Queued ' + playlist.items.length + ' songs';
            }

            const resource = await this.generateAudioResource(link);

            if (addType == "start") {
                this.queue.addToStart(resource)
            } else {
                this.queue.addToEnd(resource)
            }

            const message = 'Added to queue: ' + resource.metadata.title;

            console.log(message);

            if (this.musicPlayer.getCurrentState() == MusicPlayerState.Idle) {
                return message + '\n' + this.next(voiceChannel);
            }

            return message;
        }
    }

    stop() {
        this.musicPlayer.stop();
        this.queue.clear();

        return 'Stopped';
    }

    unpause() {
        if (this.musicPlayer.unpause()) {
            return 'Unpaused';
        }
        else {
            return 'Cannot unpause';
        }
    }

    disconnect() {
        if (this.currentConnection) {
            this.currentConnection.disconnect();

            return 'Disconnected';
        }

        return 'No connection is available';
    }
}