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
            require('./../deassembly/Deassembly.js').run(args[1]);
        }
    }
}

module.exports = CheckCommand;