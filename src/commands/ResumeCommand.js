require('./../BedrockUpdateBot.js');

class ResumeCommand {
    static getName() {
        return 'resume';
    }

    static getDescription() {
        return 'Resume the song paused';
    }

    static getPermission() {
        return 'everyone';
    }

    static executeCommand(message) {
        if (message.member.voiceChannel) {
            botManager.voice_handler.resume();
            message.channel.send("The music has been unpaused.");
        }
    }
}

module.exports = ResumeCommand;