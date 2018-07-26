require('./../BedrockUpdateBot.js')
const request = require('request');
const Discord = require('discord.js');

class CheckMCPEVersionTask {
    static getDelay() {
        return 30000;
    }

    static getName() {
        return "CheckMCPEVersionTask";
    }

    static check(Bot) {
        var url = "http://145.239.168.187/LastApps.php"
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                botManager.errorNumber = 0;
                if (body["Android"]["Version"] !== botManager.config["lastVersionAndroid"] && body["Android"]["Version"] !== botManager.config["lastVersionAndroid2"] && typeof body["Android"]["Version"] !== "undefined" && body["Android"]["Version"] !== null && body["Android"]["Version"].match(/^[0-9.]+$/) != null) {
                    if (!body["Android"]["Version"].includes("Var")) {
                        console.log(body["Android"]["Version"])
                        Bot.users.forEach(function (element) {
                            if (element.username == "Miste") {
                                element.send("A new version is out on the GooglePlayStore ! (" + body["Android"]["Version"] + ")");
                                botManager.config["lastVersionAndroid2"] = botManager.config["lastVersionAndroid"];
                                botManager.config["lastVersionAndroid"] = body["Android"]["Version"];
                                botManager.config["lastVersionReleased"] = body["Android"]["Version"];
                                botManager.config["lastVersionReleasedIsBeta"] = false;
                                botManager.saveConfig()
                                var embed = new Discord.RichEmbed()
                                    .setTitle(`A new version is out on the Google Play Store: ` + botManager.config["lastVersionAndroid"] + " :pushpin:")
                                    .setDescription(body["Android"]["Description"])
                                    .setColor('#0941a9')
                                    .setAuthor("BedrockUpdateBot", botManager.avatarURL)
                                botManager.sendToChannels('news', embed)
                                //botManager.sendToChannels('pmmp', '!force_check')
                                botManager.sendToChannels('debug', "A new version is out on the GooglePlayStore ! (" + body["Android"]["Version"] + ") ")
                            }
                        });
                        botManager.client.post('statuses/update', { status: '📌 A new version is out on the Google Play Store: ' + body["Android"]["Version"] + " !\n\n#RT" }, function (error, tweet, response) { });
                    }
                }

                if (body["Amazon"]["Version"] !== botManager.config["lastVersionAmazon"] && body["Amazon"]["Version"] !== botManager.config["lastVersionAmazon2"] && typeof body["Amazon"]["Version"] !== "undefined" && body["Amazon"]["Version"] !== null) {
                    if (!body["Amazon"]["Version"].includes("Var")) {
                        console.log(body["Amazon"]["Version"])
                        Bot.users.forEach(function (element) {
                            if (element.username == "Miste") {
                                element.send("A new version is out on the AmazonStore ! (" + body["Amazon"]["Version"] + ")");
                                botManager.config["lastVersionAmazon2"] = botManager.config["lastVersionAmazon"];
                                botManager.config["lastVersionAmazon"] = body["Amazon"]["Version"];
                                botManager.saveConfig()
                                var embed = new Discord.RichEmbed()
                                    .setTitle(`A new version is out on the Amazon Store: ` + botManager.config["lastVersionAmazon"] + " :pushpin:")
                                    .setColor('#0941a9')
                                    .setAuthor("BedrockUpdateBot", botManager.avatarURL)
                                botManager.sendToChannels('news', embed)
                                botManager.sendToChannels('debug', "A new version is out on the AmazonStore ! (" + body["Amazon"]["Version"] + ") ")
                            }
                        });
                        botManager.client.post('statuses/update', { status: '📌 A new version is out on the AmazonStore: ' + body["Amazon"]["Version"] + " !\n\n#RT" }, function (error, tweet, response) { });
                    }
                }
            } else {
                botManager.errorNumber++;
                if (botManager.errorNumber > 2) {
                    Bot.users.forEach(function (element) {
                        if (element.username == "Miste") {
                            element.send("Can't ping the website.");
                        }
                    });
                }
            }
        })
    }
}

module.exports = CheckMCPEVersionTask;