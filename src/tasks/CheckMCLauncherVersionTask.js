require('./../BedrockUpdateBot.js')
var request = require('request');
const Discord = require('discord.js');

class CheckMCLauncherVersionTask {
    static getDelay() {
        return 60000;
    }

    static getName() {
        return "CheckMCLauncherVersionTask";
    }

    static check(Bot) {
        var url = "https://launchermeta.mojang.com/mc/game/version_manifest.json"
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                if (body["versions"][0]["id"] !== botManager.config["lastMcVersion"] && body["versions"][0]["id"] !== botManager.config["lastMcVersion2"]) {
                    botManager.config["lastMcVersion2"] = botManager.config["lastMcVersion"];
                    botManager.config["lastMcVersion"] = body["versions"][0]["id"];
                    botManager.saveConfig()
                    Bot.users.forEach(function (element) {
                        if (element.username == "Miste") {
                            element.send("A new version is out on the minecraft launcher " + botManager.config["lastMcVersion"])
                        }
                    });
                    var embed = new Discord.RichEmbed()
                        .setTitle("A new " + body["versions"][0]["type"] + " is out on the Minecraft launcher " + botManager.config["lastMcVersion"] + " :pushpin:")
                        .setColor('#0941a9')
                        .setAuthor("BedrockUpdateBot", botManager.avatarURL)
                        .setFooter("Release time: " + (new Date(body["versions"][0]["releaseTime"])).toString())
                    botManager.channelToSend.send({ embed })
                    botManager.channelToSend3.send({ embed })
                    embed.setFooter("Made with ❤ by Miste (https://twitter.com/Misteboss_mcpe)", "https://cdn.discordapp.com/avatars/198825092547870721/ac3aa3645c92a29a0a7de0957d3622fb.png")
                    //botManager.channelToSend4.send({ embed })
                    botManager.channelToSend2.send({ embed })

                    botManager.client.post('statuses/update', { status: '📌 A new ' + body["versions"][0]["type"] + ' is out on the minecraft launcher ' + botManager.config["lastMcVersion"] + " !\n\n#RT" }, function (error, tweet, response) { });

                }
            }
        })
    }
}

module.exports = CheckMCLauncherVersionTask;