require('./../BedrockUpdateBot.js')
const request = require('request');
const Discord = require('discord.js');


class CheckFeedbackWebsiteTask {
    static getDelay() {
        return 30000;
    }

    static getName() {
        return "CheckFeedbackWebsiteTask";
    }

    static shouldRun() {
        return false;
    }

    static check(Bot) {
        //not working anymore
        let url = "http://194.9.172.113/PMMPBot.php";
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            let index;
            let embed;
            let text2;
            if (!error && response.statusCode === 200) {
                if (body["Release"][0] !== botManager.config["latestFeedbackArticleRelease"] && body["Release"][0] !== botManager.config["latestFeedbackArticleRelease2"] && typeof body["Release"][0] !== 'undefined' && body["Release"][0] !== 0) {
                    text2 = "";
                    for (index = 0; index < body["Release"][1].length; ++index) {
                        if (body["Release"][1][index] !== "") {
                            body["Release"][1][index] = body["Release"][1][index].replace("&amp", "(link)");
                            if (body["Release"][1][index].endsWith(":")) {
                                body["Release"][1][index] = "__**" + body["Release"][1][index] + "**__";
                            } else if (body["Release"][1][index].endsWith("the update.")) {
                                body["Release"][1][index] = "*" + body["Release"][1][index] + "*\n";
                            } else if (!body["Release"][1][index].endsWith("the update.") && body["Release"][1][index].length < 20) {
                                body["Release"][1][index] = "  **" + body["Release"][1][index] + ":**";
                            } else {
                                body["Release"][1][index] = "      ● " + body["Release"][1][index] + "";
                            }
                            text2 = text2 + body["Release"][1][index] + "\n";
                        }
                    }



                    if (text2.length > 2048) {
                        embed = new Discord.MessageEmbed()
                            .setTitle(`[RELEASE] A new article is out: ` + body["Release"][0] + " :pushpin:")
                            .setColor('#0941a9')
                            .setDescription(text2.substr(0, 2048))
                            .setURL("https://feedback.minecraft.net" + body["Release"][2]);
                        botManager.client.post('statuses/update', { status: '📌 A new article is out: ' + body["Release"][0] + ' !\n📲 https://feedback.minecraft.net' + body["Release"][2] + "\n\n#RT" }, function (error, tweet, response) {
                            botManager.sendToChannels('news', embed)
                            botManager.sendToChannels('news', "You can see the rest of the changelog on the website (too big to be displayed here).")
                        });
                    } else {
                        embed = new Discord.MessageEmbed()
                            .setTitle(`A new article is out: ` + body["Release"][0] + " :pushpin:")
                            .setColor('#0941a9')
                            .setDescription(text2)
                            .setURL("https://feedback.minecraft.net" + body["Release"][2]);
                        botManager.client.post('statuses/update', { status: '📌 A new article is out: ' + body["Release"][0] + ' !\n📲 https://feedback.minecraft.net' + body["Release"][2] + "\n\n#RT" }, function (error, tweet, response) {
                            botManager.sendToChannels('news', embed)
                        });
                    }
                    botManager.config["latestFeedbackArticleRelease2"] = botManager.config["latestFeedbackArticleRelease"];
                    botManager.config["latestFeedbackArticleRelease"] = body["Release"][0];
                    botManager.saveConfig()
                }

                if (body["Beta"][0] !== botManager.config["latestFeedbackArticleBeta"] && body["Beta"][0] !== botManager.config["latestFeedbackArticleBeta2"] && typeof body["Beta"][0] !== 'undefined' && body["Beta"][0] !== 0) {
                    text2 = "";
                    for (index = 0; index < body["Beta"][1].length; ++index) {
                        if (body["Beta"][1][index] !== "") {
                            body["Beta"][1][index] = body["Beta"][1][index].replace("&amp", "(link)");
                            if (body["Beta"][1][index].endsWith(":")) {
                                body["Beta"][1][index] = "__**" + body["Beta"][1][index] + "**__";
                            } else if (body["Beta"][1][index].endsWith("the update.")) {
                                body["Beta"][1][index] = "*" + body["Beta"][1][index] + "*\n";
                            } else if (!body["Beta"][1][index].endsWith("the update.") && body["Beta"][1][index].length < 20) {
                                body["Beta"][1][index] = "  **" + body["Beta"][1][index] + ":**";
                            } else {
                                body["Beta"][1][index] = "      ● " + body["Beta"][1][index] + "";
                            }
                            text2 = text2 + body["Beta"][1][index] + "\n";
                        }
                    }



                    if (text2.length > 2048) {
                        embed = new Discord.MessageEmbed()
                            .setTitle(`[BETA] A new article is out: ` + body["Beta"][0] + " :pushpin:")
                            .setColor('#0941a9')
                            .setDescription(text2.substr(0, 2048))
                            .setURL("https://feedback.minecraft.net" + body["Beta"][2]);
                        botManager.client.post('statuses/update', { status: '📌 A new article is out: ' + body["Beta"][0] + ' !\n📲 https://feedback.minecraft.net' + body["Beta"][2] + "\n\n#RT" }, function (error, tweet, response) {
                            botManager.sendToChannels('news', embed)
                            botManager.sendToChannels('news', "You can see the rest of the changelog on the website (too big to be displayed here).")
                        });
                    } else {
                        embed = new Discord.MessageEmbed()
                            .setTitle(`A new article is out: ` + body["Beta"][0] + " :pushpin:")
                            .setColor('#0941a9')
                            .setDescription(text2)
                            .setURL("https://feedback.minecraft.net" + body["Beta"][2]);
                            botManager.client.post('statuses/update', { status: '📌 A new article is out: ' + body["Beta"][0] + ' !\n📲 https://feedback.minecraft.net' + body["Beta"][2] + "\n\n#RT" }, function (error, tweet, response) {
                                botManager.sendToChannels('news', embed)
                            });
                    }
                    botManager.config["latestFeedbackArticleBeta2"] = botManager.config["latestFeedbackArticleBeta"];
                    botManager.config["latestFeedbackArticleBeta"] = body["Beta"][0];
                    botManager.saveConfig()
                }
            }
        })
    };
}

module.exports = CheckFeedbackWebsiteTask;