require('./../BedrockUpdateBot.js')
const request = require('request');
const Discord = require('discord.js');

class CheckBedrockServerTask {
    static getDelay() {
        return 30000;
    }

    static getName() {
        return "CheckBedrockServerTask";
    }

    static shouldRun() {
        return false;
    }

    static check(Bot) {
        let url = "http://194.9.172.113/BedrockServer.php";
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                if (body.length === 2) {
                    if (body[0] !== botManager.config['BSWin10'] && body[0] !== botManager.config['BSWin102']) {
                        let win10Version = body[0].split("bedrock-server-")[1].split(".zip")[0];

                        botManager.config["BSWin102"] = botManager.config["BSWin10"];
                        botManager.config["BSWin10"] = body[0];
                        botManager.saveConfig()

                        let embed = new Discord.MessageEmbed()
                            .setTitle('A new version of the BedrockServer Win10 is available for: ' + win10Version + " :pushpin:")
                            .setColor('#0941a9');

                        botManager.client.post('statuses/update', { status: '📌 A new version of the BedrockServer Win10 is available for: ' + win10Version + " !" }, function (error, tweet, response) {
                            botManager.sendToChannels('news', embed)
                            botManager.sendToMiste(embed)
                        });
                    }
                    if (body[1] !== botManager.config['BSLinux'] && body[1] !== botManager.config['BSLinux2']) {
                        let linuxVersion = body[1].split("bedrock-server-")[1].split(".zip")[0];

                        botManager.config["BSLinux2"] = botManager.config["BSLinux2"];
                        botManager.config["BSLinux"] = body[1];
                        botManager.saveConfig()

                        let embedLinux = new Discord.MessageEmbed()
                            .setTitle('A new version of the BedrockServer Linux is available for: ' + linuxVersion + " :pushpin:")
                            .setColor('#0941a9');

                        botManager.client.post('statuses/update', { status: '📌 A new version of the BedrockServer Linux is available for: ' + linuxVersion + " !" }, function (error, tweet, response) {
                            botManager.sendToChannels('news', embedLinux)
                            botManager.sendToMiste(embedLinux)
                        });
                        require('./../disassembly/BedrockServerDisassembly.js').run(body[1], linuxVersion);
                    }
                } else {
                    botManager.sendToMiste("Incorrect body length for BedrockServer array !")
                }
            }
        })
    }
}

module.exports = CheckBedrockServerTask;