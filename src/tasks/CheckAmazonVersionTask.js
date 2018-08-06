require('./../BedrockUpdateBot.js')
var request = require('request');
const Discord = require('discord.js');

class CheckAmazonVersionTask {
    static getDelay() {
        return 30000;
    }

    static getName() {
        return "CheckAmazonVersionTask";
    }

    static check(Bot) {
        var url = "http://145.239.168.187/LastApps.php"
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                botManager.errorNumber = 0;
                if (body["Amazon"]["Version"] !== botManager.config["lastVersionAmazon"] && body["Amazon"]["Version"] !== botManager.config["lastVersionAmazon2"] && typeof body["Amazon"]["Version"] !== "undefined" && body["Amazon"]["Version"] !== null) {
                    if (!body["Amazon"]["Version"].includes("Var")) {
                        console.log(body["Amazon"]["Version"])
                        Bot.users.forEach(function (element) {
                            if (element.id == botManager.config['ownerId']) {
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
                        if (element.id == botManager.config['ownerId']) {
                            element.send("Can't ping the website.");
                        }
                    });
                }
            }
        })
    }
}

module.exports = CheckAmazonVersionTask;