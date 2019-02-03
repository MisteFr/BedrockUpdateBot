const yaml_config = require('node-yaml');
const config = yaml_config.readSync("./../../config.yml");
const fs = require('fs');
const https = require('https');
const Repeat = require('repeat');
const path = require("path");
const Twitter = require('twitter');
const Discord = require('discord.js');

class BedrockUpdateBotManager {

    constructor() {
        this.voice_handler = null;
        this.link = null;
        this.array = [];
        this.errorNumber = 0;
        this.audio_stream = null;
        this.needConfirmation = undefined;
        this.needConfirmationAuthor = undefined;
        this.LastContent = undefined;
        this.config = config;
        this.turn = 0;
    }

    init(Bot) {
        exports.Bot = Bot;
        this.Bot = Bot;
        this.avatarURL = Bot.user.avatarURL;
        this.username = Bot.user.username;
        this.isDoingDisassembly = false;
        this.isDoingMarketplaceCheck = false;

        Bot.user.setActivity("Mojang | >help | " + this.Bot.guilds.size + " guilds", { type: ("WATCHING") });

        console.log('Logging in Twitter..')
        this.client = new Twitter({
            consumer_key: config["Twitter"]["consumer_key"],
            consumer_secret: config["Twitter"]["consumer_secret"],
            access_token_key: config["Twitter"]["access_token_key"],
            access_token_secret: config["Twitter"]["access_token_secret"]
        });
        
        this.hytaleClient = new Twitter({
            consumer_key: config["hytaleTwitter"]["consumer_key"],
            consumer_secret: config["hytaleTwitter"]["consumer_secret"],
            access_token_key: config["hytaleTwitter"]["access_token_key"],
            access_token_secret: config["hytaleTwitter"]["access_token_secret"]
        });

        this.channelToDebugMcpe = Bot.guilds.get(this.config['specialId']).channels.find('name', 'updates');


        console.log('Registering commands..')
        this.Bot.commands = new Discord.Collection();
        let commandFolder = fs.readdirSync(path.join(__dirname, './../commands'));
        for (const file of commandFolder) {
            const command = require('./../commands/' + file);
            this.Bot.commands.set(command.getName(), command);
        }

        console.log('Registering channels..')
        this.Bot.channelsToSend = new Discord.Collection();
        for (var key in this.config["channels"]) {
            this.Bot.channelsToSend.set(key, this.config["channels"][key]);
        }

        console.log("Checking for servers joined when the bot was offline..")
        var i = 0;
        this.Bot.guilds.forEach(guild => {
            if (!this.config['waitingForFinalRegister'].includes(guild.id) && this.config['channels'][guild.id] === undefined) {
                this.getDefaultChannel(guild)
                    .then(channel => channel.send("Hey <@" + guild.ownerID + "> !\nThanks for adding me on your server !\nCan you please tell me in what channel do you want me to send the latest news concerning Minecraft and Minecraft Bedrock Edition by answering to this message 'The channel I chose is <name>'\n\n**Please note that if I don't have the perms to post in this channel you won't see any news !**"))
                this.config["waitingForFinalRegister"].push(guild.id)
                this.saveConfig()
                i++;
            }
        })

        console.log("Added to " + i + " servers.")

        console.log("Checking for servers removed when the bot was offline..")
        var i = 0;
        this.Bot.channelsToSend.forEach((data, id) => {
            if (!this.Bot.guilds.has(id)) {
                i++;
                if (this.config['channels'][id] !== null && this.config['channels'][id] !== undefined) {
                    delete this.config['channels'][id]
                    this.saveConfig()
                    this.Bot.channelsToSend.delete(id)
                }
            }
        })

        console.log("Removed from " + i + " servers.")

        console.log('Scheduling Tasks..')
        let taskFolder = fs.readdirSync(path.join(__dirname, './../tasks'));
        this.Bot.tasks = new Discord.Collection();
        for (let file of taskFolder) {
            let task = require('./../tasks/' + file);
            this.Bot.tasks.set(task.getName(), [task.getDelay(), task.getDelay()]);
        }
        Repeat(this.taskActivator).every('1000', 'ms').start.in('1', 'sec')

        console.log('I am ready!');
    }



    /*
        Little hack to access to the functions of the different tasks class because Repeat or node-scheduler can't keep the link to them
    */

    taskActivator() {
        var Bot = exports.Bot;
        if (!botManager.isDoingDisassembly) {
            if (new Date().getDay() === 2 && new Date().getHours() === 19 && new Date().getMinutes() === 0) {
                require('./../tasks/CheckMarketplaceTask.js').check(Bot);
            }
            for (var [file, value] of Bot.tasks) {
                if (value[0] == value[1]) {
                    if (file === "CheckMarketplaceTask.js") {
                        if (!this.isDoingMarketplaceCheck) {
                            Bot.tasks.set(file, [value[0], 0]);
                            require('./../tasks/' + file + '.js').check(Bot);
                        }
                    } else {
                        Bot.tasks.set(file, [value[0], 0]);
                        require('./../tasks/' + file + '.js').check(Bot);
                    }
                } else {
                    Bot.tasks.set(file, [value[0], (value[1] + 1000)]);
                }
            }
        }
    }

    sendToChannels(type = "news", toSend) {
        this.Bot.channelsToSend.forEach((data, id) => {
            var guildId = id;
            for (var key in data) {
                var channelName = Object.keys(data[key])[0];
                for (var key2 in Object.values(data[key])) {
                    for (var key3 in Object.values(data[key])[key2]) {
                        var requiredType = Object.values(data[key])[key2][key3];
                        if (requiredType == type) {
                            var channel = this.Bot.guilds.get(guildId).channels.find('name', channelName);
                            if (channel !== null && channel !== undefined) {
                                channel.send(toSend)
                                    .catch(() => function () {
                                        this.getDefaultChannel(channel.guild)
                                            .then(function (channelToSend) {
                                                console.log("resent")
                                                channelToSend.send(toSend)
                                                channelToSend.send("Hey <@" + channel.guild.ownerID + "> !\nI don't have the perms to post in the channel '" + channel.name + "', can you give me the perms to post their ?")
                                            })
                                    })
                            }
                        }
                    }
                }
            }
        });
        if (type === "news") {
            botManager.config['waitingForFinalRegister'].forEach(function (element) {
                var guild = botManager.Bot.guilds.get(element)
                if (guild !== undefined) {
                    botManager.getDefaultChannel(guild)
                        .then(function (channel) {
                            channel.send(toSend)
                            channel.send("Hey <@" + guild.ownerID + "> !\nYou didnt set any channel for me to post in so I posted in the first channel I found :(.\nYou can fix this problem by answering to this message 'The channel I chose is <name>'\n\n**Please note that if I don't have the perms to post in this channel you won't see any news !**")
                        })
                }
            })
        }
    }


    saveConfig() {
        yaml_config.writeSync("./../../config.yml", this.config)
    }

    createNewConsoleMessage() {
        this.channelToDebugMcpe.send("```\nCONSOLE```")
        this.LastContent = "\nCONSOLE\n";
    }

    updateConsole(content) {
        this.channelToDebugMcpe.fetchMessages({ limit: 50 }).then(messages => {
            let messagesArr = messages.array();
            let messageCount = messagesArr.length;
            let i2 = 0;
            for (let i = 0; i < messageCount; i++) {
                if (messagesArr[i].author.username == "BedrockUpdateBot" && messagesArr[i].content.includes("CONSOLE")) {
                    if (i2 == 0) {
                        messagesArr[i].edit("```" + this.LastContent + "\n" + content + "```");
                        this.LastContent = this.LastContent + "\n" + content;
                    }
                    i2++;
                }
            }
        });
    }

    getImage(url, callback) {
        https.get(url, res => {
            const bufs = [];
            res.on('data', function (chunk) {
                bufs.push(chunk)
            });
            res.on('end', function () {
                const data = Buffer.concat(bufs);
                callback(null, data);
            });
        })
            .on('error', callback);
    }

    titleCase(str) {
        return str.toLowerCase().split(' ').map(function (word) {
            return word.replace(word[0], word[0].toUpperCase());
        }).join(' ');
    }

    cleanArray(actual) {
        var newArray = new Array();
        for (var i = 0; i < actual.length; i++) {
            if (actual[i]) {
                newArray.push(actual[i]);
            }
        }
        return newArray;
    }

    sleep(sleepDuration) {
        var now = new Date().getTime();
        while (new Date().getTime() < now + sleepDuration) { /* do nothing (doesnt affect the child process)*/ }
    }

    async getDefaultChannel(guild) {
        if (guild.channels.has(guild.id))
            return guild.channels.get(guild.id)

        if (guild.channels.exists("name", "general"))
            return guild.channels.find("name", "general");

        return guild.channels
            .filter(c => c.type === "text" &&
                c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
            .sort((a, b) => a.position - b.position ||
                Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
            .first();
    }

}

module.exports = BedrockUpdateBotManager;