require('./../BedrockUpdateBot.js');

class PauseCommand {
    static getName() {
        return 'pause';
    }

    static getDescription() {
        return 'Pause the actual song';
    }

    static getPermission() {
        return 'everyone';
    }

    static executeCommand(message) {
        if (message.member.voiceChannel) {
            botManager.voice_handler.pause();
            message.channel.send("The music have been paused.");
        }
    }
}

module.exports = PauseCommand;