require('./../BedrockUpdateBot.js')
var request = require('request');
const Discord = require('discord.js');

class CheckFeaturedServerList {
    static getDelay() {
        return 60000;
    }

    static getName() {
        return "CheckFeaturedServerList";
    }

    static check(Bot) {
        var jsonObject = { "count": true, "filter": "(contentType eq '3PP') and platforms/any(p: p eq 'uwp.store') and contents/any(c: c/minClientVersion le '" + botManager.config["lastVersionAndroid"] + "' and c/maxClientVersion gt '" + botManager.config["lastVersionAndroid"] + "')", "orderBy": "startDate desc", "scid": "4fc10100-5f7a-4470-899b-280835760c07", "top": 25 };

        var url = "https://xforge.xboxlive.com/v2/catalog/items/search"
        request({
            url: url,
            method: "POST",
            body: jsonObject,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                if (body.count > botManager.config["featuredServersCount"]) {
                    for (var key in body.results) {
                        var name = body.results[key]["title"].neutral;
                        if (name !== "The Hive" && name !== "Mineplex" && name !== "Lifeboat Network" && name !== "CubeCraft Games" && name !== "InPvP - Fun Space Minigames") {
                            botManager.config["featuredServersCount"] = body.count;
                            botManager.saveConfig()

                            var embed = new Discord.RichEmbed()
                                .setTitle('A new featured server is available on MCBE: ' + body.results[key].title.neutral + " :pushpin:")
                                .setDescription("IP: " + body.results[key].displayProperties.url + "\nPort: " + body.results[key].displayProperties.port + "\nCreator name: " + body.results[key].displayProperties.creatorName)
                                .setColor('#0941a9')
                            botManager.client.post('statuses/update', { status: '📌 A new featured server is available on MCBE: ' + body.results[key].title.neutral + "!\n\n#RT" }, function (error, tweet, response) {
                                botManager.sendToChannels('news', embed)
                            });
                        }
                    }
                }
            } else {
                Bot.users.forEach(function (element) {
                    if (element.id == botManager.config['ownerId']) {
                        element.send("Server list return failed.");
                    }
                });
            }
        })
    }
}

module.exports = CheckFeaturedServerList;