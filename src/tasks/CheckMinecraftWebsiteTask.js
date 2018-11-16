require('./../BedrockUpdateBot.js')
var request = require('request');
const Discord = require('discord.js');
var https = require('https');

class CheckMinecraftWebsiteTask {
    static getDelay() {
        return 30000;
    }

    static getName() {
        return "CheckMinecraftWebsiteTask";
    }

    static check(Bot) {
        var url = "https://minecraft.net/en-us/api/tiles/channel/not_set,Community%20content/region/None/category/Culture,Insider,Merch,News"
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var textContainingTitles = "";
                var toCheck = botManager.config["textContainingTitles"];
                body["result"].forEach(function (element) {
                    if (!(toCheck.includes(element["default_tile"]["title"]))) {
                        console.log(element["default_tile"]["title"]);
                        botManager.config["textContainingTitles"] += element["default_tile"]["title"] + ", ";

                        botManager.config["lastWebsiteArticle2"] = botManager.config["lastWebsiteArticle"];
                        botManager.config["lastWebsiteArticle"] = element["default_tile"]["title"];
                        botManager.saveConfig()

                        var embed = new Discord.RichEmbed()
                            .setTitle(botManager.config["lastWebsiteArticle"] + " :pushpin:")
                            .setDescription('**' + element["default_tile"]["sub_header"] + '**')
                            .setColor('#0941a9')
                            .setAuthor("BedrockUpdateBot", botManager.avatarURL)
                            .setURL("https://minecraft.net" + element["url"])
                            .setImage(element["default_tile"]["image"]["original"]["url"])
                            .setTimestamp(new Date((element["published_at"]) * 1000))


                        botManager.getImage(element["default_tile"]["image"]["original"]["url"], function (err, data) {
                            if (err) {
                                throw new Error(err);
                            } else {
                                botManager.client.post('media/upload', { media: data }, function (error, media, response) {

                                    if (!error) {
                                        var status = {
                                            status: '📌 A new article is out on the Minecraft website: ' + botManager.config["lastWebsiteArticle"] + " !\n📲 https://minecraft.net" + element["url"] + "\n\n#RT",
                                            media_ids: media.media_id_string // Pass the media id string
                                        }

                                        botManager.client.post('statuses/update', status, function (error, tweet, response) {
                                            botManager.sendToChannels('news', embed)
                                        });

                                    }
                                });
                            }
                        });
                    }
                });
            }
        })
    }
}

module.exports = CheckMinecraftWebsiteTask;