export class Validator {
    youtubeReg = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;

    constructor() { }

    validateYoutubeLink(link: string) {
        return this.youtubeReg.test(link);
    }
}
