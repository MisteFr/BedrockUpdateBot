require('./../BedrockUpdateBot.js');

class CheckCommand{
    static getName() {
        return 'check';
    }

    static getDescription() {
        return '';
    }

    static getPermission() {
        return 'miste';
    }

    static executeCommand(message) {
        let args = message.content.split(">check ");
        if (args[1] !== null) {
            botManager.channelToDebugMcpe.fetchMessage(args[1])
                .then(message => botManager.checkMessage(message))
                .catch(console.error);
        }
    }
}

module.exports = CheckCommand;