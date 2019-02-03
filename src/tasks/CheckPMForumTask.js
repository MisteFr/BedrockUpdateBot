require('./../BedrockUpdateBot.js')
var request = require('request');
const Discord = require('discord.js');
var FeedParser = require('feedparser');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

class CheckPMForumTask {
    static getDelay() {
        return 20000;
    }

    static getName() {
        return "CheckPMForumTask";
    }

    static check(Bot) {
        var req = request('https://forums.pmmp.io/forums/-/index.rss')
        var feedparser = new FeedParser();


        req.on('response', function (res) {
            var stream = this;

            if (res.statusCode !== 200) {
                Bot.users.forEach(function (element) {
                    if (element.id == botManager.config['ownerId']) {
                        element.send("Forums error.");
                    }
                });
            }
            else {
                stream.pipe(feedparser);
            }
        });

        req.on('error', function (error) {
            console.log(error)
        })


        feedparser.on('readable', function () {
            var stream = this;
            var meta = this.meta;
            var item;

            while (item = stream.read()) {
                if (!(item.hasOwnProperty(['slash:comments'])) && item.title !== botManager.config["lastPMForumPost"] && new Date(item.date) > new Date(botManager.config["lastPMForumPostDate"])) {
                    var embed = new Discord.RichEmbed()
                        .setTitle(item.title)
                        .setURL(item.permalink)
                        .setDescription("**Author:\n**" + item['rss:author'].name + "\n\n**Post:**\n" + (entities.decode((item.description.replace(/<(?:.|\n)*?>/gm, '')))).substring(0, 2000))
                        .setColor('#0941a9')
                        .setFooter("PMMP Forum")
                        .setTimestamp(new Date(item.date))
                    botManager.sendToChannels('forum', embed)
                    botManager.config["lastPMForumPost"] = item.title;
                    botManager.config["lastPMForumPostDate"] = item.date;
                    botManager.saveConfig()
                }
            }

        });
    }
}

module.exports = CheckPMForumTask;