require('./../BedrockUpdateBot.js')
const request = require('request');
const Discord = require('discord.js');

class CheckMinecraftWebsiteTask {
    static getDelay() {
        return 30000;
    }

    static getName() {
        return "CheckMinecraftWebsiteTask";
    }

    static shouldRun() {
        return true;
    }

    static check(Bot) {
        let url = "http://www.minecraft.net/content/minecraft-net/_jcr_content.articles.grid?tileselection=auto&tagsPath=minecraft:article/news,minecraft:article/insider,minecraft:article/culture,minecraft:article/merch,minecraft:stockholm/news,minecraft:stockholm/guides,minecraft:stockholm/events,minecraft:stockholm/minecraft-builds,minecraft:stockholm/marketplace,minecraft:stockholm/deep-dives,minecraft:stockholm/merch,minecraft:stockholm/earth,minecraft:stockholm/dungeons,minecraft:stockholm/realms-plus,minecraft:stockholm/realms-java,minecraft:stockholm/minecraft,minecraft:stockholm/nether&propResPath=/content/minecraft-net/language-masters/en-us/jcr:content/root/generic-container/par/bleeding_page_sectio_1278766118/page-section-par/grid&count=500&pageSize=4&lang=/content/minecraft-net/language-masters/en-us"
        request({
            url: url,
            headers: {
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-GB,en;q=0.5",
                "Connection": "keep-alive",
                "DNT": "1",
                "Host": "www.minecraft.net",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
                "Upgrade-Insecure-Requests": "1"
            },
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                let toCheck = botManager.config["textContainingTitles"];
                body["article_grid"].forEach(function (element) {
                    if (!(toCheck.includes(element["default_tile"]["title"])) && botManager.config["lastWebsiteArticle"] !== element["default_tile"]["title"]) {
                        console.log(element["default_tile"]["title"])
                        botManager.config["textContainingTitles"] += element["default_tile"]["title"] + ", ";

                        botManager.config["lastWebsiteArticle2"] = botManager.config["lastWebsiteArticle"];
                        botManager.config["lastWebsiteArticle"] = element["default_tile"]["title"];
                        botManager.saveConfig()

                        let embed = new Discord.MessageEmbed()
                            .setTitle(botManager.config["lastWebsiteArticle"] + " :pushpin:")
                            .setDescription('**' + element["default_tile"]["sub_header"] + '**')
                            .setColor('#0941a9')
                            .setURL("https://minecraft.net" + element["article_url"])
                            .setImage("https://www.minecraft.net" + element["default_tile"]["image"]["imageURL"])
                            .setTimestamp(new Date((element["publish_date"]) * 1000))

                        botManager.client.post('statuses/update', { status: '📌 A new article is out on the Minecraft website: ' + botManager.config["lastWebsiteArticle"] + " !\n📲 https://minecraft.net" + element["article_url"] + "" }, function (error, tweet, response) {
                            botManager.sendToChannels('news', embed)
                        });

                        /*
                        botManager.getImage("https://www.minecraft.net" + element["default_tile"]["image"]["imageURL"], function (err, data) {
                            if (err) {
                                throw new Error(err);
                            } else {
                                botManager.client.post('media/upload', { media: data }, function (error, media, response) {
                                    if (!error) {
                                        let status = {
                                            status: '📌 A new article is out on the Minecraft website: ' + botManager.config["lastWebsiteArticle"] + " !\n📲 https://minecraft.net" + element["article_url"] + "",
                                            media_ids: media.media_id_string // Pass the media id string
                                        }

                                        botManager.client.post('statuses/update', status, function (error, tweet, response) {

                                        });

                                    }
                                });
                            }
                        });
                         */
                    }
                });
            }
        })
    }
}

module.exports = CheckMinecraftWebsiteTask;