require('./../BedrockUpdateBot.js')
var request = require('request');
const Discord = require('discord.js');
var https = require('https');

class CheckTeamMojangChannelTask {
    static getDelay() {
        return 30000;
    }

    static getName() {
        return "CheckTeamMojangChannelTask";
    }

    static check(Bot) {
        var url = "http://145.239.47.15/LastVideo.php"
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                if (body["title"] != botManager.config["latestVideo"] && body["title"] != botManager.config["latestVideo2"] && typeof body["title"] !== 'undefined' && body !== "null") {
                    const embed = new Discord.RichEmbed()
                        .setTitle("A new video is out on the TeamMojang channel ! :pushpin:")
                        .setColor('#0941a9')
                        .setAuthor("BedrockUpdateBot", botManager.avatarURL)
                        .setDescription("**Title**: " + body["title"] + "\n**Description**: " + body["description"] + "\n**Published at**: " + body["publishedAt"]);
                    embed.setURL("https://www.youtube.com/watch?v=" + body["id"]["videoId"])
                    
                    botManager.config["latestVideo2"] = botManager.config["latestVideo"];
                    botManager.config["latestVideo"] = body["title"];
                    botManager.saveConfig()

                    botManager.client.post('statuses/update', { status: '📌 A new video is out: ' + body["title"] + ' !\n📲 https://www.youtube.com/watch?v=' + body["id"]["videoId"] + "\n\n#RT" }, function (error, tweet, response) {
                        botManager.sendToChannels('news', embed)
                    });
                }
            }
        })
    }
}

module.exports = CheckTeamMojangChannelTask;