require('./../BedrockUpdateBot.js')
var request = require('request');
const Discord = require('discord.js');

class CheckBedrockServerTask {
    static getDelay() {
        return 30000;
    }

    static getName() {
        return "CheckBedrockServerTask";
    }

    static check(Bot) {
        var url = "http://145.239.47.15/BedrockServer.php"
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                if (body.length === 2) {
                    if (body[0] !== botManager.config['BSWin10']) {
                        var win10Version = body[0].split("bedrock-server-")[1].split(".zip")[0];

                        botManager.config["BSWin10"] = body[0];
                        botManager.saveConfig()

                        var embed = new Discord.RichEmbed()
                            .setTitle('A new version of the BedrockServer Win10 is available for: ' + win10Version + " :pushpin:")
                            .setColor('#0941a9')
                            .setAuthor("BedrockUpdateBot", botManager.avatarURL)
                        botManager.client.post('statuses/update', { status: '📌 A new version of the BedrockServer Win10 is available for: ' + win10Version + " !\n\n#RT" }, function (error, tweet, response) {
                            botManager.sendToChannels('news', embed)
                            botManager.Bot.users.forEach(function (element) {
                                if (element.id == botManager.config['ownerId']) {
                                    element.send(embed);
                                }
                            });
                        });
                    }
                    if (body[1] !== botManager.config['BSLinux']) {
                        var linuxVersion = body[1].split("bedrock-server-")[1].split(".zip")[0];

                        botManager.config["BSLinux"] = body[1];
                        botManager.saveConfig()

                        var embed = new Discord.RichEmbed()
                            .setTitle('A new version of the BedrockServer Linux is available for: ' + linuxVersion + " :pushpin:")
                            .setColor('#0941a9')
                            .setAuthor("BedrockUpdateBot", botManager.avatarURL)
                        botManager.client.post('statuses/update', { status: '📌 A new version of the BedrockServer Linux is available for: ' + linuxVersion + " !\n\n#RT" }, function (error, tweet, response) {
                            botManager.sendToChannels('news', embed)
                            botManager.Bot.users.forEach(function (element) {
                                if (element.id == botManager.config['ownerId']) {
                                    element.send(embed);
                                }
                            });
                        });
                        require('./../disassembly/BedrockServerDisassembly.js').run(body[1], linuxVersion);
                    }
                } else {
                    Bot.users.forEach(function (element) {
                        if (element.id == botManager.config['ownerId']) {
                            element.send("Incorrect body length for BedrockServer array !");
                        }
                    });
                }
            }
        })
    }
}

module.exports = CheckBedrockServerTask;