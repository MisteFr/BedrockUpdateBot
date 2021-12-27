require('./../BedrockUpdateBot.js')
const request = require('request');
const Discord = require('discord.js');

class CheckWikiHistoryTask {
    static getDelay() {
        return 60000;
    }

    static getName() {
        return "CheckWikiHistoryTask";
    }

    static check(Bot) {
        let url = "http://194.9.172.113/WikiHistory.php"
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                if (body["ScriptingDoc"]["title"] !== botManager.config["ScriptingDocTitle"]) {
                    const embed = new Discord.MessageEmbed()
                        .setTitle("Scripting documentation updated")
                        .setColor('#0941a9')
                        .setDescription("**Title**: " + body["ScriptingDoc"]["title"] + "\n**Author**: " + body["ScriptingDoc"]["author"])
                        .setURL("https://minecraft.gamepedia.com" + body["ScriptingDoc"]["link"])
                        .setTimestamp(new Date())
                    
                    botManager.config["ScriptingDocTitle"] = body["ScriptingDoc"]["title"];
                    botManager.saveConfig()

                    Bot.users.cache.forEach(function (element) {
                        if (element.id === botManager.config['ownerId']) {
                            element.send(embed)
                        }
                    });
                    botManager.sendToChannels('documentation', embed)
                }
                if (body["BetaAddonDoc"]["title"] !== botManager.config["BetaAddonDocTitle"]) {
                    const embed = new Discord.MessageEmbed()
                        .setTitle("BetaAddon documentation updated")
                        .setColor('#0941a9')
                        .setDescription("**Title**: " + body["BetaAddonDoc"]["title"] + "\n**Author**: " + body["BetaAddonDoc"]["author"])
                        .setURL("https://minecraft.gamepedia.com" + body["BetaAddonDoc"]["link"])
                        .setTimestamp(new Date())
                    
                    botManager.config["BetaAddonDocTitle"] = body["BetaAddonDoc"]["title"];
                    botManager.saveConfig()

                    Bot.users.cache.forEach(function (element) {
                        if (element.id === botManager.config['ownerId']) {
                            element.send(embed)
                        }
                    });
                    botManager.sendToChannels('documentation', embed)
                }
                if (body["UIDoc"]["title"] !== botManager.config["UIDocTitle"]) {
                    const embed = new Discord.MessageEmbed()
                        .setTitle("UI documentation updated")
                        .setColor('#0941a9')
                        .setDescription("**Title**: " + body["UIDoc"]["title"] + "\n**Author**: " + body["UIDoc"]["author"])
                        .setURL("https://minecraft.gamepedia.com" + body["UIDoc"]["link"])
                        .setTimestamp(new Date())
                    
                    botManager.config["UIDocTitle"] = body["UIDoc"]["title"];
                    botManager.saveConfig()

                    Bot.users.cache.forEach(function (element) {
                        if (element.id === botManager.config['ownerId']) {
                            element.send(embed)
                        }
                    });
                    botManager.sendToChannels('documentation', embed)
                }
                if (body["ParticleDoc"]["title"] !== botManager.config["ParticleDocTitle"]) {
                    const embed = new Discord.MessageEmbed()
                        .setTitle("Particle documentation updated")
                        .setColor('#0941a9')
                        .setDescription("**Title**: " + body["ParticleDoc"]["title"] + "\n**Author**: " + body["ParticleDoc"]["author"])
                        .setURL("https://minecraft.gamepedia.com" + body["ParticleDoc"]["link"])
                        .setTimestamp(new Date())
                    
                    botManager.config["ParticleDocTitle"] = body["ParticleDoc"]["title"];
                    botManager.saveConfig()

                    Bot.users.cache.forEach(function (element) {
                        if (element.id === botManager.config['ownerId']) {
                            element.send(embed)
                        }
                    });
                    botManager.sendToChannels('documentation', embed)
                }
                if (body["MolangDoc"]["title"] !== botManager.config["MolangDocTitle"]) {
                    const embed = new Discord.MessageEmbed()
                        .setTitle("MoLang documentation updated")
                        .setColor('#0941a9')
                        .setDescription("**Title**: " + body["MolangDoc"]["title"] + "\n**Author**: " + body["MolangDoc"]["author"])
                        .setURL("https://minecraft.gamepedia.com" + body["MolangDoc"]["link"])
                        .setTimestamp(new Date())
                    
                    botManager.config["MolangDocTitle"] = body["MolangDoc"]["title"];
                    botManager.saveConfig()

                    Bot.users.cache.forEach(function (element) {
                        if (element.id === botManager.config['ownerId']) {
                            element.send(embed)
                        }
                    });
                    botManager.sendToChannels('documentation', embed)
                }
                if (body["AnimationsDoc"]["title"] !== botManager.config["AnimationsDocTitle"]) {
                    const embed = new Discord.MessageEmbed()
                        .setTitle("Animations documentation updated")
                        .setColor('#0941a9')
                        .setDescription("**Title**: " + body["AnimationsDoc"]["title"] + "\n**Author**: " + body["AnimationsDoc"]["author"])
                        .setURL("https://minecraft.gamepedia.com" + body["AnimationsDoc"]["link"])
                        .setTimestamp(new Date())
                    
                    botManager.config["AnimationsDocTitle"] = body["AnimationsDoc"]["title"];
                    botManager.saveConfig()

                    Bot.users.cache.forEach(function (element) {
                        if (element.id === botManager.config['ownerId']) {
                            element.send(embed)
                        }
                    });
                    botManager.sendToChannels('documentation', embed)
                }
                if (body["BiomesDoc"]["title"] !== botManager.config["BiomesDocTitle"]) {
                    const embed = new Discord.MessageEmbed()
                        .setTitle("Biomes documentation updated")
                        .setColor('#0941a9')
                        .setDescription("**Title**: " + body["BiomesDoc"]["title"] + "\n**Author**: " + body["BiomesDoc"]["author"])
                        .setURL("https://minecraft.gamepedia.com" + body["BiomesDoc"]["link"])
                        .setTimestamp(new Date())
                    
                    botManager.config["BiomesDocTitle"] = body["BiomesDoc"]["title"];
                    botManager.saveConfig()

                    Bot.users.cache.forEach(function (element) {
                        if (element.id === botManager.config['ownerId']) {
                            element.send(embed)
                        }
                    });
                    botManager.sendToChannels('documentation', embed)
                }
                if (body["BlocksDoc"]["title"] !== botManager.config["BlocksDocTitle"]) {
                    const embed = new Discord.MessageEmbed()
                        .setTitle("MoLang documentation updated")
                        .setColor('#0941a9')
                        .setDescription("**Title**: " + body["BlocksDoc"]["title"] + "\n**Author**: " + body["BlocksDoc"]["author"])
                        .setURL("https://minecraft.gamepedia.com" + body["BlocksDoc"]["link"])
                        .setTimestamp(new Date())
                    
                    botManager.config["BlocksDocTitle"] = body["BlocksDoc"]["title"];
                    botManager.saveConfig()

                    Bot.users.cache.forEach(function (element) {
                        if (element.id === botManager.config['ownerId']) {
                            element.send(embed)
                        }
                    });
                    botManager.sendToChannels('documentation', embed)
                }
                if (body["EntityComponentDoc"]["title"] !== botManager.config["EntityComponentDocTitle"]) {
                    const embed = new Discord.MessageEmbed()
                        .setTitle("Entity components documentation updated")
                        .setColor('#0941a9')
                        .setDescription("**Title**: " + body["EntityComponentDoc"]["title"] + "\n**Author**: " + body["EntityComponentDoc"]["author"])
                        .setURL("https://minecraft.gamepedia.com" + body["EntityComponentDoc"]["link"])
                        .setTimestamp(new Date())
                    
                    botManager.config["EntityComponentDocTitle"] = body["EntityComponentDoc"]["title"];
                    botManager.saveConfig()

                    Bot.users.cache.forEach(function (element) {
                        if (element.id === botManager.config['ownerId']) {
                            element.send(embed)
                        }
                    });
                    botManager.sendToChannels('documentation', embed)
                }
                if (body["EntityEventsDoc"]["title"] !== botManager.config["EntityEventsDocTitle"]) {
                    const embed = new Discord.MessageEmbed()
                        .setTitle("Entity events documentation updated")
                        .setColor('#0941a9')
                        .setDescription("**Title**: " + body["EntityEventsDoc"]["title"] + "\n**Author**: " + body["EntityEventsDoc"]["author"])
                        .setURL("https://minecraft.gamepedia.com" + body["EntityEventsDoc"]["link"])
                        .setTimestamp(new Date())
                    
                    botManager.config["EntityEventsDocTitle"] = body["EntityEventsDoc"]["title"];
                    botManager.saveConfig()

                    Bot.users.cache.forEach(function (element) {
                        if (element.id === botManager.config['ownerId']) {
                            element.send(embed)
                        }
                    });
                    botManager.sendToChannels('documentation', embed)
                }
                if (body["RecipesDoc"]["title"] !== botManager.config["RecipesDocTitle"]) {
                    const embed = new Discord.MessageEmbed()
                        .setTitle("Recipes Documentation updated")
                        .setColor('#0941a9')
                        .setDescription("**Title**: " + body["RecipesDoc"]["title"] + "\n**Author**: " + body["RecipesDoc"]["author"])
                        .setURL("https://minecraft.gamepedia.com" + body["RecipesDoc"]["link"])
                        .setTimestamp(new Date())
                    
                    botManager.config["RecipesDocTitle"] = body["RecipesDoc"]["title"];
                    botManager.saveConfig()

                    Bot.users.cache.forEach(function (element) {
                        if (element.id === botManager.config['ownerId']) {
                            element.send(embed)
                        }
                    });
                    botManager.sendToChannels('documentation', embed)
                }
                if (body["SchemasDoc"]["title"] !== botManager.config["SchemasDocTitle"]) {
                    const embed = new Discord.MessageEmbed()
                        .setTitle("Schemas documentation updated")
                        .setColor('#0941a9')
                        .setDescription("**Title**: " + body["SchemasDoc"]["title"] + "\n**Author**: " + body["SchemasDoc"]["author"])
                        .setURL("https://minecraft.gamepedia.com" + body["SchemasDoc"]["link"])
                        .setTimestamp(new Date())
                    
                    botManager.config["SchemasDocTitle"] = body["SchemasDoc"]["title"];
                    botManager.saveConfig()

                    Bot.users.cache.forEach(function (element) {
                        if (element.id === botManager.config['ownerId']) {
                            element.send(embed)
                        }
                    });
                    botManager.sendToChannels('documentation', embed)
                }
            }
        })
    }
}

module.exports = CheckWikiHistoryTask;