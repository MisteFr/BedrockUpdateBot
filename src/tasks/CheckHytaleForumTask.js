require('./../BedrockUpdateBot.js')
const request = require('request');
const Discord = require('discord.js');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

class CheckHytaleForumTask {
    static getDelay() {
        return 60000;
    }

    static getName() {
        return "CheckHytaleForumTask";
    }

    static shouldRun() {
        return true;
    }

    static check(Bot) {
        let url = "https://www.hytale.com/api/blog/post/published";
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                if (body[0].title !== botManager.config["lastHytalePost"] && body[0].title !== botManager.config["lastHytalePost2"]) {
                    botManager.config["lastHytalePost"] = botManager.config["lastHytalePost2"];
                    botManager.config["lastHytalePost"] = body[0].title;
                    botManager.saveConfig()
                    let embed = new Discord.MessageEmbed()
                        .setTitle(body[0].title)
                        .setDescription(entities.decode(body[0].bodyExcerpt))
                        .setColor('#0941a9')
                        .setAuthor(body[0].author)
                        .setTimestamp(new Date(body[0].publishedAt))
                        .setURL("https://www.hytale.com/news/" + (new Date().getFullYear()) + "/" + (new Date().getMonth() + 1) + "/" + body[0].slug);

                    botManager.hytaleClient.post('statuses/update', { status: '📌 ' + body[0].title + '\n\n' + (entities.decode(body[0].bodyExcerpt)).substring(0,190) + '..\n\n📲 https://www.hytale.com/news/' + (new Date().getFullYear()) + "/" + (new Date().getMonth() + 1) + "/" + body[0].slug + "" }, function (error, tweet, response) {
                        botManager.sendToChannels('hytale', embed)
                    });
                }
            } else {
                botManager.sendToMiste("Hytale Task error.")
            }
        })
    }
}

module.exports = CheckHytaleForumTask;