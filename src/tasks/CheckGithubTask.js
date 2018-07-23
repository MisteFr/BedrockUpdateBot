require('./../BedrockUpdateBot.js')
var request = require('request');
const Discord = require('discord.js');

class CheckGithubTask {
    static getDelay() {
        return 120000;
    }

    static getName() {
        return "CheckGithubTask";
    }

    static check(Bot) {
        var url = "https://rsxhmw26sa.execute-api.eu-west-3.amazonaws.com/zd"
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                if (body["commit"]["sha"] !== botManager.config["lastSteadfastSHA"]) {
                    Bot.users.forEach(function (element) {
                        if (element.username == "Miste") {
                            element.send("A new commit is available on Steadfast2: **" + body["commit"]["commit"]["message"] + "** (" + body["commit"]["html_url"] + ")")
                        }
                    });
                    botManager.config["lastSteadfastSHA"] = body["commit"]["sha"];
                    botManager.saveConfig()

                    var url = "https://api.github.com/repos/Hydreon/Steadfast2/commits/" + botManager.config["lastSteadfastSHA"];
                    request({
                        url: url,
                        json: true,
                        headers: {
                            'User-Agent': 'request'
                        }
                    }, function (error, response, body) {
                        if (!error && response.statusCode === 200) {
                            body["files"].forEach(function (element) {
                                if (element["filename"] == "src/pocketmine/network/protocol/Info.php") {

                                    var embed = new Discord.RichEmbed()
                                        .setTitle("A new commit changing the protocols accepted was made on SteadFast2")
                                        .setDescription(element["patch"])
                                        .setColor('#0941a9')
                                        .setAuthor("BedrockUpdateBot", botManager.avatarURL)
                                        .setURL("https://github.com/Hydreon/Steadfast2/commit/" + botManager.config["lastSteadfastSHA"])
                                    Bot.users.forEach(function (element) {
                                        if (element.username == "Miste") {
                                            element.send({ embed })
                                        }
                                    });

                                }
                            });
                        }
                    })
                }
            }
        })
    }
}

module.exports = CheckGithubTask;