require('./../BedrockUpdateBot.js')
var request = require('request');
const Discord = require('discord.js');

class CheckPatchNotesTask {
    static getDelay() {
        return 30000;
    }

    static getName() {
        return "CheckPatchNotesTask";
    }

    static check(Bot) {
        let jsonObject = { "count": true, "filter": "(contentType eq 'PatchNotes')", "orderBy": "startDate desc", "scid": "4fc10100-5f7a-4470-899b-280835760c07", "top": 100 }
        request({
            url: "https://xforge.xboxlive.com/v2/catalog/items/search",
            method: "POST",
            body: jsonObject,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                if (body.results[0].id !== botManager.config["lastPatchNotes"] && body.results[0].id !== botManager.config["lastPatchNotes2"]) {
                    botManager.config["lastPatchNotes2"] = botManager.config["lastPatchNotes"];
                    botManager.config["lastPatchNotes"] = body.results[0].id;
                    botManager.saveConfig()

                    botManager.getPatchNotesFrom(body.results[0].id, true, function (response) {
                        if (Array.isArray(response)) {
                            var embed = new Discord.MessageEmbed()
                                .setTitle("New Patch Notes: " + body.results[0].title.neutral)
                                .setDescription(response[1])
                                .setColor('#0941a9')
                                .setTimestamp(new Date())
                                .setImage(body.results[0].images[0].url)
                                .setURL(response[2])

                            botManager.client.post('statuses/update', { status: '📌 New Patch Notes were published for: ' + body.results[0].title.neutral + '!\n📲 ' + response[2] + '\n\n#RT' }, function (error, tweet, response) {
                                botManager.sendToChannels('news', embed)
                            });
                        } else {
                            var embed = new Discord.MessageEmbed()
                                .setTitle("New Patch Notes: " + body.results[0].title.neutral)
                                .setColor('#0941a9')
                                .setTimestamp(new Date())
                                .setImage(body.results[0].images[0].url)

                            botManager.client.post('statuses/update', { status: '📌 New Patch Notes were published for: ' + body.results[0].title.neutral + '\n\n#RT' }, function (error, tweet, response) {
                                botManager.sendToChannels('news', embed)
                            });
                        }
                    })

                }
            }
        })
    }
}

module.exports = CheckPatchNotesTask;