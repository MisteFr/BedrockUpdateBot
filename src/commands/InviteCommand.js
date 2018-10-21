require('./../BedrockUpdateBot.js');

class InviteCommand {
    static getName() {
        return 'invite';
    }

    static getDescription() {
        return 'Get the invite link of the bot';
    }

    static getPermission() {
        return 'everyone';
    }

    static executeCommand(message) {
        message.channel.send(botManager.config["inviteLink"])
    }
}

module.exports = InviteCommand;