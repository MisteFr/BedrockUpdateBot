var yaml_config = require('node-yaml');
var config = yaml_config.readSync("./../../config.yml");
var fs = require('fs');
var https = require('https');
var Repeat = require('repeat');
var path = require("path");
var Twitter = require('twitter');
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
    }

    init(Bot) {
        exports.Bot = Bot;
        this.Bot = Bot;
        this.avatarURL = Bot.user.avatarURL;
        this.username = Bot.user.username;

        Bot.user.setActivity("Mojang website..", { type: ("WATCHING") });

        console.log('Logging in Twitter..')
        this.client = new Twitter({
            consumer_key: config["Twitter"]["consumer_key"],
            consumer_secret: config["Twitter"]["consumer_secret"],
            access_token_key: config["Twitter"]["access_token_key"],
            access_token_secret: config["Twitter"]["access_token_secret"]
        });

        this.channelToSend = Bot.guilds.get("287339519500353537").defaultChannel;
        this.channelToSend2 = Bot.guilds.get("373199722573201408").channels.find('name', 'mcpe-update');
        this.channelToSend3 = Bot.guilds.get("373234183516061696").channels.find('name', 'bots');
        //this.channelToSend4 = Bot.guilds.get("355180995709763605").channels.find('name', 'minecraft');
        this.channelToTest = Bot.guilds.get("287339519500353537").channels.find('name', 'bots');
        this.channelToDebugMcpe = Bot.guilds.get("287339519500353537").channels.find('name', 'updates');


        console.log('Registering commands..')
        this.Bot.commands = new Discord.Collection();
        let commandFolder = fs.readdirSync(path.join(__dirname, './../commands'));
        for (const file of commandFolder) {
            const command = require('./../commands/' + file);
            this.Bot.commands.set(command.getName(), command);
        }


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
        for (var [file, value] of Bot.tasks) {
            if (value[0] == value[1]) {
                Bot.tasks.set(file, [value[0], 0]);
                require('./../tasks/' + file + '.js').check(Bot);
            } else {
                Bot.tasks.set(file, [value[0], (value[1] + 1000)]);
            }
        }
    }


    saveConfig() {
        yaml_config.writeSync("./../../config.yml", this.config)
    }


    checkMessage(message) {
        require('./../decompiler/Decompiler.js').checkMessage(message);
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

}

module.exports = BedrockUpdateBotManager;