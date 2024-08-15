import { AudioResource } from "@discordjs/voice";

export class Queue {
    queue: AudioResource[] = [];

    constructor() { }

    addToEnd(resource: AudioResource) {
        this.queue.push(resource);
    }

    addArrayToEnd(resourceArray: AudioResource[]) {
        for (let index = 0; index < resourceArray.length; index++) {
            this.queue.push(resourceArray[index])
        }
    }

    addToStart(resource: AudioResource) {
        this.queue.unshift(resource)
    }

    addArrayToStart(resourceArray: AudioResource[]) {
        for (let index = resourceArray.length; index > 0; index--) {
            this.queue.unshift(resourceArray[index])
        }
    }

    getNext() {
        if (this.queue.length) {
            return this.queue.shift();
        }

        return null;
    }

    clear() {
        if (this.queue.length) {
            this.queue.length = 0;
        }
    }
}