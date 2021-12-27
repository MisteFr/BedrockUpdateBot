require('./../BedrockUpdateBot.js');

class PostCommand {
    static getName() {
        return 'post';
    }

    static getDescription() {
        return '';
    }

    static getPermission() {
        return 'miste';
    }

    static executeCommand(message) {
        botManager.sendToChannels('pmmp', message.content.replace(">post", ""))
    }
}

module.exports = PostCommand;