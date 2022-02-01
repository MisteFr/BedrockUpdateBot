require('./../BedrockUpdateBot.js')
const request = require('request');
const Discord = require('discord.js');

class CheckFeaturedServerList {
    static getDelay() {
        return 60000;
    }

    static getName() {
        return "CheckFeaturedServerList";
    }

    static shouldRun() {
        return true;
    }

    static check(Bot) {
        let jsonObject = {
            "count": true,
            "filter": "(contentType eq '3PP_V2.0') and platforms/any(tp: tp eq 'uwp.store' and tp eq 'title.bedrockvanilla')",
            "orderBy": "startDate desc",
            "scid": "4fc10100-5f7a-4470-899b-280835760c07",
            "select": "images",
            "top": 25
        };

        let url = "https://xforge.xboxlive.com/v2/catalog/items/search";
        request({
            url: url,
            method: "POST",
            body: jsonObject,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                if (body.count > botManager.config["featuredServersCount"]) {
                    console.log(body)
                    for (let key in body.results) {
                        let name = body.results[key]["title"].neutral;
                        if (name !== "The Hive" && name !== "Mineplex" && name !== "Lifeboat Network" && name !== "CubeCraft Games" && name !== "Mineville City : Roleplay") {
                            botManager.config["featuredServersCount"] = body.count;
                            botManager.saveConfig()

                            let embed = new Discord.MessageEmbed()
                                .setTitle('A new featured server is available on MCBE: ' + body.results[key].title.neutral + " :pushpin:")
                                .setDescription("IP: " + body.results[key].displayProperties.url + "\nPort: " + body.results[key].displayProperties.port + "\nCreator name: " + body.results[key].displayProperties.creatorName)
                                .setColor('#0941a9');
                            botManager.client.post('statuses/update', { status: '📌 A new featured server is available on MCBE: ' + body.results[key].title.neutral + "!\n\n#RT" }, function (error, tweet, response) {
                                botManager.sendToChannels('news', embed)
                            });
                        }
                    }
                }
            } else {
                botManager.sendToMiste("Server list return failed.")
            }
        })
    }
}

module.exports = CheckFeaturedServerList;