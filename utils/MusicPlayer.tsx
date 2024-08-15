import { AudioPlayer, AudioPlayerStatus, AudioResource, createAudioPlayer, NoSubscriberBehavior } from '@discordjs/voice';
import { suiBotInstance } from '..';


export enum MusicPlayerState {
    Idle,
    Playing,
    Paused,
    Error,
}

export class MusicPlayer {

    player: AudioPlayer;
    currentState: MusicPlayerState = MusicPlayerState.Idle;

    constructor() {
        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });

        this.player.on(AudioPlayerStatus.Idle, () => {
            this.currentState = MusicPlayerState.Idle
        })

        this.player.on(AudioPlayerStatus.Buffering, () => {
            console.log('Buffering...');
        });

        this.player.on(AudioPlayerStatus.AutoPaused, () => {
            console.log('Autopaused');
        });

        this.player.on(AudioPlayerStatus.Playing, () => {
            console.log('The audio player has started playing!');
            this.currentState = MusicPlayerState.Playing
        });

        this.player.on(AudioPlayerStatus.Paused, () => {
            console.log('The audio player is paused!');
            this.currentState = MusicPlayerState.Paused
        });

        this.player.on('error', error => {
            console.error(`player:`);
            console.error(error);
            this.currentState = MusicPlayerState.Error
        });
    }

    pause() {
        return this.player.pause();
    }

    unpause() {
        return this.player.unpause();
    }

    stop() {
        this.player.stop();
        suiBotInstance.disconnect();
    }

    play(resource: AudioResource) {
        this.player.play(resource);
    }

    getPlayer() {
        return this.player;
    }

    getCurrentState() {
        return this.currentState
    }

}