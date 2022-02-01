require('./../BedrockUpdateBot.js')
const request = require('request');
const Discord = require('discord.js');

class CheckMCLauncherVersionTask {
    static getDelay() {
        return 60000;
    }

    static getName() {
        return "CheckMCLauncherVersionTask";
    }

    static shouldRun() {
        return true;
    }

    static check(Bot) {
        var url = "https://launchermeta.mojang.com/mc/game/version_manifest.json"
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                if (body["versions"][0]["id"] !== botManager.config["lastMcVersion"] && body["versions"][0]["id"] !== botManager.config["lastMcVersion2"]) {
                    console.log(body["versions"][0]["id"])
                    botManager.config["lastMcVersion2"] = botManager.config["lastMcVersion"];
                    botManager.config["lastMcVersion"] = body["versions"][0]["id"];
                    botManager.saveConfig()
                    var embed = new Discord.MessageEmbed()
                        .setTitle("A new " + body["versions"][0]["type"] + " is out on the Minecraft launcher " + botManager.config["lastMcVersion"] + " :pushpin:")
                        .setColor('#0941a9')
                        .setAuthor("BedrockUpdateBot", botManager.avatarURL)
                        .setTimestamp(new Date(body["versions"][0]["releaseTime"]))

                    botManager.client.post('statuses/update', { status: '📌 A new ' + body["versions"][0]["type"] + ' is out on the minecraft launcher ' + botManager.config["lastMcVersion"] + " !\n\n#RT" }, function (error, tweet, response) {
                        botManager.sendToChannels('news', embed)
                    });

                }
            }
        })
    }
}

module.exports = CheckMCLauncherVersionTask;