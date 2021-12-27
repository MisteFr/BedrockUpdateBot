require('./../BedrockUpdateBot.js');

class KillCommand {
    static getName() {
        return 'kill';
    }

    static getDescription() {
        return 'Kill the bot (emergency command)';
    }

    static getPermission() {
        return 'everyone';
    }

    static executeCommand(message) {
        if(message.author.tag === "Miste#0001" && !message.author.bot){
            botManager.needConfirmation = true;
            botManager.needConfirmationAuthor = message.author.tag;
            message.channel.send("Do you really want to stop this bot ?");
            message.channel.send("If yes please answer to this message ``" + message.author.tag + " confirms that he wants to stop this bot``");
            botManager.Bot.destroy();
        }
        
    }
}

module.exports = KillCommand;