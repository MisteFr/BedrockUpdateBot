const Discord = require('discord.js');
require('./../BedrockUpdateBot.js');

class LatestMcpeCommand {
    static getName() {
        return 'latestMcpe';
    }

    static getDescription() {
        return 'Get the latest MCPE informations';
    }

    static getPermission() {
        return 'everyone';
    }

    static executeCommand(message) {
        var embed = new Discord.MessageEmbed()
            .setTitle("Minecraft Bedrock versions informations")
            .setDescription("Latest release: " + botManager.config["lastVersionAndroid"] + "\nLatest beta: " + botManager.config["lastVersionAndroidBeta"])
            .setColor('#0941a9')
            .setAuthor("BedrockUpdateBot", botManager.avatarURL)
        message.channel.send({ embed })
    }
}

module.exports = LatestMcpeCommand;