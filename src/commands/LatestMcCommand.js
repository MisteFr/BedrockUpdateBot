const Discord = require('discord.js');
const request = require('request');

class LatestMcCommand {
    static getName() {
        return 'latestMc';
    }

    static getDescription() {
        return 'Get the latest MC informations';
    }

    static getPermission() {
        return 'everyone';
    }

    static executeCommand(message) {
        let url = "https://launchermeta.mojang.com/mc/game/version_manifest.json"
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                let embed = new Discord.MessageEmbed()
                    .setTitle("Minecraft versions informations")
                    .setDescription("Latest release: " + body["latest"]["release"] + "\nLatest snapshot: " + body["latest"]["snapshot"])
                    .setColor('#0941a9')
                    .setAuthor("BedrockUpdateBot", botManager.avatarURL)
                message.channel.send({ embed })
            }
        })
    }
}

module.exports = LatestMcCommand;