require('./../BedrockUpdateBot.js');

class StopCommand {
    static getName() {
        return 'stop';
    }

    static getDescription() {
        return 'Stop the song beeing played';
    }

    static getPermission() {
        return 'everyone';
    }

    static executeCommand(message) {
        if (message.member.voiceChannel) {
            if (botManager.voice_handler !== null) {
                botManager.voice_handler.end();
            }
            message.channel.send("The music have been stopped.");
            message.member.voiceChannel.leave();
        }
    }
}

module.exports = StopCommand;