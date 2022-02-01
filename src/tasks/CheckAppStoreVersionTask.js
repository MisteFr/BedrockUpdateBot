require('./../BedrockUpdateBot.js')
const request = require('request');
const Discord = require('discord.js');

class CheckAppStoreVersionTask {
    static getDelay() {
        return 30000;
    }

    static getName() {
        return "CheckAppStoreVersionTask";
    }

    static shouldRun() {
        return true;
    }

    static check(Bot) {
        let url = "https://itunes.apple.com/lookup?id=%20479516143";
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                if (body.resultCount > 0) {
                    if (body.results[0].version !== botManager.config['lastVersioniOS'] && body.results[0].version !== botManager.config['lastVersioniOS2']) {
                        botManager.config["lastVersioniOS2"] = botManager.config["lastVersioniOS"];
                        botManager.config["lastVersioniOS"] = body.results[0].version;

                        botManager.saveConfig()


                        let embed = new Discord.MessageEmbed()
                            .setTitle(`A new version is out on the AppStore: ` + botManager.config["lastVersioniOS"] + " :pushpin:")
                            .setDescription(body.results[0].releaseNotes.substr(0, 2000))
                            .setColor('#0941a9')
                            .setTimestamp(new Date(body.results[0].currentVersionReleaseDate));


                        botManager.client.post('statuses/update', { status: '📌 A new version is out on the AppleStore: ' + botManager.config["lastVersioniOS"] + " !\n\n#RT" }, function (error, tweet, response) {
                            botManager.sendToChannels("news", embed)
                            botManager.sendToChannels('debug', "A new version is out on the AppleStore ! (" + botManager.config["lastVersioniOS"] + ") ")
                        });
                    }

                } else {
                    botManager.sendToMiste("iOSStore: resultCount: 0")
                }
            }
        })
    }
}

module.exports = CheckAppStoreVersionTask;