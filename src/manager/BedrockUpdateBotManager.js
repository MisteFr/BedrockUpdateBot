const yaml_config = require('node-yaml');
const config = yaml_config.readSync("./../../config.yml");
const loginConfig = yaml_config.readSync("./../../bot.yml");
const fs = require('fs');
const https = require('https');
const Repeat = require('repeat');
const path = require("path");
const Twitter = require('twitter');
const Discord = require('discord.js');
const http = require('http');
const client = require('scp2')
const StreamZip = require('node-stream-zip');
const request = require('request');
const Long = require("long");

class BedrockUpdateBotManager {

    constructor() {
        this.voice_handler = null;
        this.array = [];
        this.needConfirmation = undefined;
        this.needConfirmationAuthor = undefined;
        this.LastContent = undefined;
        this.config = config;
        this.loginConfig = loginConfig;
        this.turn = 0;
        this.countAdded;
    }

    init(Bot) {
        exports.Bot = Bot;
        this.Bot = Bot;
        this.avatarURL = Bot.user.avatarURL;
        this.username = Bot.user.username;
        this.isDoingDisassembly = false;
        this.isDoingMarketplaceCheck = false;
        this.isCheckingPatchNotes = false;

        Bot.users.fetch("198825092547870721", true)

        Bot.user.setActivity("Mojang | >help | " + this.Bot.guilds.cache.size + " guilds", { type: ("WATCHING") });

        console.log('Logging in Twitter..')
        this.client = new Twitter({
            consumer_key: loginConfig["Twitter"]["consumer_key"],
            consumer_secret: loginConfig["Twitter"]["consumer_secret"],
            access_token_key: loginConfig["Twitter"]["access_token_key"],
            access_token_secret: loginConfig["Twitter"]["access_token_secret"]
        });

        this.hytaleClient = new Twitter({
            consumer_key: loginConfig["hytaleTwitter"]["consumer_key"],
            consumer_secret: loginConfig["hytaleTwitter"]["consumer_secret"],
            access_token_key: loginConfig["hytaleTwitter"]["access_token_key"],
            access_token_secret: loginConfig["hytaleTwitter"]["access_token_secret"]
        });

        this.channelToDebugMcpe = Bot.guilds.cache.get('419294780921479178').channels.cache.get('614121817765838848');

        console.log('Registering commands..')
        this.Bot.commands = new Discord.Collection();
        let commandFolder = fs.readdirSync(path.join(__dirname, './../commands'));
        for (const file of commandFolder) {
            const command = require('./../commands/' + file);
            this.Bot.commands.set(command.getName(), command);
        }

        console.log('Registering channels..')
        this.Bot.guildsToSend = new Discord.Collection();
        for (let key in this.loginConfig["channels"]) {
            this.Bot.guildsToSend.set(key, this.loginConfig["channels"][key]);
        }

        /*
        console.log("Checking for servers joined when the bot was offline..")
        var i = 0;
        this.Bot.guilds.cache.forEach(guild => {
            if (!this.loginConfig['waitingForFinalRegister'].includes(guild.id) && this.loginConfig['channels'][guild.id] === undefined) {
                const defaultChannel = this.getDefaultChannel(guild)
                defaultChannel.send("Hey <@" + guild.ownerID + "> !\nThanks for adding me on your server !\nCan you please tell me in what channel do you want me to send the latest news concerning Minecraft and Minecraft Bedrock Edition by answering to this message 'The channel I choose is <name>'\n\n**Please note that if I don't have the perms to post in this channel you won't see any news !**")
                this.loginConfig["waitingForFinalRegister"].push(guild.id)
                this.saveConfig()
                i++;
            }
        })

        console.log("Added to " + i + " servers.")

        console.log("Checking for servers removed when the bot was offline..")
        var i = 0;
        this.Bot.guildsToSend.forEach((data, id) => {
            if (!this.Bot.guilds.cache.has(id)) {
                i++;
                if (this.loginConfig['channels'][id] !== null && this.loginConfig['channels'][id] !== undefined) {
                    this.sendToMiste("taskStart guildId: " + id + ".")
                    delete this.loginConfig['channels'][id]
                    this.Bot.guildsToSend.delete(id)
                }
            }
        })
        this.saveConfig()

        console.log("Removed from " + i + " servers.")

        */

        console.log("Checking for servers not being in the waiting list anymore..")
        this.loginConfig['waitingForFinalRegister'].forEach(function (element) {
            let guild = botManager.Bot.guilds.cache.get(element);
            if (!guild) {
                botManager.loginConfig["waitingForFinalRegister"] = botManager.loginConfig["waitingForFinalRegister"].filter(item => item !== element)
            }
        })
        this.saveConfig()

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
        let Bot = exports.Bot;
        Bot.user.setActivity("Mojang | >help | " + Bot.guilds.cache.size + " guilds", { type: ("WATCHING") });
        if (!botManager.isDoingDisassembly) {
            if (new Date().getDay() === 2 && new Date().getHours() === 19 && new Date().getMinutes() === 0 && new Date().getSeconds() === 10) {
                require('./../tasks/CheckMarketplaceTask.js').check(Bot, true);
                require('./../tasks/CheckPersonaTask.js').check(Bot, true);
            }
            if (new Date().getDay() !== botManager.config["lastSaveDay"]) {
                botManager.copyFile("/home/MisteBot/MarketplaceData.json", "/var/www/html/MCPE/Marketplace/MarketplaceData-" + Date.now() + ".json")
                botManager.config["lastSaveDay"] = new Date().getDay();
            }
            for (let [file, value] of Bot.tasks) {
                if (value[0] === value[1]) {
                    if (!this.isDoingMarketplaceCheck) {
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
        this.Bot.guildsToSend.forEach((data, id) => {
            let guildId = id;
            for (let key in data) {
                let channelName = Object.keys(data[key])[0];
                for (let key2 in Object.values(data[key])) {
                    for (let key3 in Object.values(data[key])[key2]) {
                        let requiredType = Object.values(data[key])[key2][key3];
                        if (requiredType === type) {
                            let guild = this.Bot.guilds.cache.get(guildId)
                            if (this.Bot.guilds.cache.get(guildId) !== undefined) {
                                let channel = this.Bot.guilds.cache.get(guildId).channels.cache.find(channel => channel.name === channelName);
                                if (channel !== null && channel !== undefined) {
                                    if (channel.permissionsFor(guild.client.user).has(['SEND_MESSAGES', 'EMBED_LINKS'])) {
                                        channel.send(toSend)
                                    } else {
                                        if (guild.owner !== null) {
                                            guild.owner.user.send("Failed to post in the channel '" + channelName + "'. Please fix the permissions. If you have any issues setting up the bot, dm Miste#0001.");
                                        } else {
                                            const defaultChannel = this.getDefaultChannel(channel.guild)
                                            if (defaultChannel !== null && defaultChannel !== 'undefined') {
                                                defaultChannel.send(toSend)
                                                defaultChannel.send("Failed to post in the channel '" + channelName + "'. Please fix the permissions.")
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (type === "news") {
            botManager.loginConfig['waitingForFinalRegister'].forEach(function (element) {
                let guild = botManager.Bot.guilds.cache.get(element)
                if (guild !== undefined) {
                    if (guild.owner !== null) {
                        guild.owner.user.send("Hey !\nThanks for adding me on your server !\nCan you please tell me in what channel do you want me to send the latest news concerning Minecraft and Minecraft Bedrock Edition by sending to one of the channel off your discord server 'The channel I choose is <name>'\n\n**Please note that if I don't have the perms to post in this channel you won't see any news !**");
                    }
                    const defaultChannel2 = botManager.getDefaultChannel(guild)
                    if (defaultChannel2 !== null && defaultChannel2 !== 'undefined' && typeof defaultChannel2 !== 'undefined') {
                        if (defaultChannel2.permissionsFor(guild.client.user).has("SEND_MESSAGES")) {
                            try {
                                defaultChannel2.send(toSend)
                                defaultChannel2.send("Hey <@" + guild.ownerID + "> !\nYou didnt set any channel for me to post in so I posted in the first channel I found :(.\nYou can fix this problem by answering to this message 'The channel I choose is <name>'\n\n**Please note that if I don't have the perms to post in this channel you won't see any news !**")
                            } catch (err) {
                                console.log(err)
                            }
                        } else {
                            botManager.sendToMiste("Can't send message for channel: " + defaultChannel2.name)
                        }
                    }
                }
            })
        }
    }


    saveConfig() {
        yaml_config.writeSync("./../../config.yml", this.config)
        yaml_config.writeSync("./../../bot.yml", this.loginConfig)
        botManager.copyFile("/home/MisteBot/config.yml", "/var/www/html/config.yml")
    }

    createNewConsoleMessage() {
        this.channelToDebugMcpe.send("```\nCONSOLE```")
        this.LastContent = "\nCONSOLE\n";
    }

    updateConsole(content) {
        this.channelToDebugMcpe.messages.fetch({ limit: 50 }).then(messages => {
            let messagesArr = messages.array();
            let messageCount = messagesArr.length;
            let i2 = 0;
            for (let i = 0; i < messageCount; i++) {
                if (messagesArr[i].author.username === "BedrockUpdateBot" && messagesArr[i].content.includes("CONSOLE")) {
                    if (i2 === 0) {
                        messagesArr[i].edit("```" + this.LastContent + "\n" + content + "```");
                        this.LastContent = this.LastContent + "\n" + content;
                    }
                    i2++;
                }
            }
        });
    }

    sendToMiste(message) {
        if (this.Bot) {
            this.Bot.users.cache.forEach(function (element) {
                if (element.id === botManager.loginConfig["ownerId"]) {
                    element.send(message);
                }
            });
        }else{
            console.log(message)
        }
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
        let newArray = [];
        for (let i = 0; i < actual.length; i++) {
            if (actual[i]) {
                newArray.push(actual[i]);
            }
        }
        return newArray;
    }
    getDefaultChannel = (guild) => {
        // get "original" default channel
        if (guild.channels.cache.has(guild.id))
            return guild.channels.cache.get(guild.id)

        // Check for a "general" channel, which is often default chat
        const generalChannel = guild.channels.cache.find(channel => channel.name === "general");
        if (generalChannel)
            return generalChannel;
        // Now we get into the heavy stuff: first channel in order where the bot can speak
        // hold on to your hats!
        return guild.channels.cache
            .filter(c => c.type === "text" &&
                c.permissionsFor(guild.client.user).has("SEND_MESSAGES"))
            .sort((a, b) => a.position - b.position ||
                Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
            .first();
    }

    checkVersionAndDownload(message) {
        let messageJson = JSON.parse(message.content.replace(/`/g, ""));
        let needDownload = false;
        for (let i = 0; i < messageJson.updates.length; i++) {
            if (messageJson.updates[i].packageMoniker.includes("x64")) {
                let versionObject = messageJson.updates[i];
                break;
            }
        }
        if (messageJson.isBeta === true) {
            if (botManager.config["win10Versions"][versionObject.packageMoniker] === undefined) {
                let versionName = (versionObject.packageMoniker.split("_")[1]);
                let embed = new Discord.RichEmbed()
                    .setTitle("New beta available on the Win10 Store: " + versionName)
                    .setColor('#0941a9')
                    .setAuthor("BedrockUpdateBot", botManager.avatarURL)
                botManager.client.post('statuses/update', { status: '📌 A new version is out on the Windows Store for beta users: ' + versionName + " !\n\n#RT" }, function (error, tweet, response) {
                    botManager.sendToChannels('news', embed)
                    botManager.channelToDebugMcpe.send(embed)
                });
                botManager.config["win10Versions"][versionObject.packageMoniker] = [versionObject.serverId, versionObject.updateId];
                botManager.saveConfig()
                needDownload = true;
            }
        } else {
            if (botManager.config["win10Versions"][versionObject.packageMoniker] === undefined) {
                let versionName = (versionObject.packageMoniker.split("_")[1]);
                let embed = new Discord.RichEmbed()
                    .setTitle("New release available on the Win10 Store: " + versionName)
                    .setColor('#0941a9')
                    .setAuthor("BedrockUpdateBot", botManager.avatarURL)
                botManager.client.post('statuses/update', { status: '📌 A new version is out on the Windows Store: ' + versionName + " !\n\n#RT" }, function (error, tweet, response) {
                    botManager.sendToChannels('news', embed)
                    embed.setURL("https://reset.mrarm.io/mcuwplink.php?id=" + versionObject.updateId)
                    botManager.channelToDebugMcpe.send(embed)
                });
                botManager.config["win10Versions"][versionObject.packageMoniker] = [versionObject.serverId, versionObject.updateId];
                botManager.saveConfig()
                needDownload = true;
            }
        }
        if (needDownload) {
            let packageMoniker = versionObject.packageMoniker;
            let url = versionObject.downloadUrl;
            if (!fs.existsSync("MCPE/Windows/" + versionName + "/")) {
                fs.mkdirSync("MCPE/Windows/" + versionName + "/")
            }
            let fStream = fs.createWriteStream("MCPE/Windows/" + versionName + "/" + packageMoniker + ".appx");
            const request = http.get(url, function (response) {
                response.pipe(fStream);
            });

            fStream.on('finish', function () {
                client.scp("/home/MisteBot/MCPE/Windows/" + versionName + "/" + packageMoniker + ".appx", {
                    host: botManager.loginConfig["localHOST"],
                    username: botManager.loginConfig["localUSER"],
                    password: botManager.loginConfig["localPASS"],
                    path: '/media/HDD/MCPE/Windows/' + packageMoniker + '.appx'
                }, function (err) {
                    if (err) {
                        console.log(err)
                    } else {
                        botManager.channelToDebugMcpe.send(versionName + ' available here: http://77.132.168.75/MCPE/Windows/' + packageMoniker + '.appx')
                    }
                })
            })
        }
    }

    getPatchNotesFrom(version, directlyId, callback) {
        this.isCheckingPatchNotes = true;
        if (directlyId) {
            request({
                url: "https://xforge.xboxlive.com/v2/catalog/items/" + version,
                method: "GET",
                json: true
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {

                    let zipFile = fs.createWriteStream("patchNotes.zip");
                    fs.createWriteStream("extractedPatchNotes.txt");

                    let patchURL = body['contents'][0].url;

                    https.get(body['contents'][0].url, function (response) {
                        response.pipe(zipFile);
                    });

                    zipFile.on('finish', function () {
                        let zip = new StreamZip({
                            file: "patchNotes.zip",
                            storeEntries: true
                        });

                        zip.on('ready', () => {
                            for (const entry of Object.values(zip.entries())) {
                                if (entry.name === "patch_notes_en_GB.txt") {
                                    zip.extract(entry.name, "extractedPatchNotes.txt", err => {
                                        console.log(err ? 'Extract error' : 'Extracted');

                                        fs.readFile("extractedPatchNotes.txt", 'utf8', function (err, data) {
                                            let patchText = data;

                                            zip.close()
                                            fs.unlinkSync("patchNotes.zip");
                                            fs.unlinkSync("extractedPatchNotes.txt");

                                            botManager.isCheckingPatchNotes = false;
                                            callback(["", patchText, patchURL]);
                                        });
                                    })
                                    break;
                                }
                            }
                        })
                    })
                } else {
                    botManager.isCheckingPatchNotes = false;
                    callback(null);
                }
            })
        } else {
            let jsonObject = { "count": true, "filter": "(contentType eq 'PatchNotes') and platforms/any(p: p eq 'uwp.store') and (tags/any(t: t eq '" + version + "'))", "orderBy": "startDate desc", "scid": "4fc10100-5f7a-4470-899b-280835760c07", "top": 25 }
            request({
                url: "https://xforge.xboxlive.com/v2/catalog/items/search",
                method: "POST",
                body: jsonObject,
                json: true
            }, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    if (body.count > 0) {
                        let patchId = body.results[0].id;
                        let patchDescription = body.results[0].description.neutral;
                        request({
                            url: "https://xforge.xboxlive.com/v2/catalog/items/" + patchId,
                            method: "GET",
                            json: true
                        }, function (error, response, body) {
                            if (!error && response.statusCode === 200) {

                                let zipFile = fs.createWriteStream("patchNotes.zip");
                                fs.createWriteStream("extractedPatchNotes.txt");

                                let patchURL = body['contents'][0].url;

                                https.get(body['contents'][0].url, function (response) {
                                    response.pipe(zipFile);
                                });

                                zipFile.on('finish', function () {
                                    let zip = new StreamZip({
                                        file: "patchNotes.zip",
                                        storeEntries: true
                                    });

                                    zip.on('ready', () => {
                                        for (const entry of Object.values(zip.entries())) {
                                            if (entry.name === "patch_notes_en_GB.txt") {
                                                zip.extract(entry.name, "extractedPatchNotes.txt", err => {
                                                    console.log(err ? 'Extract error' : 'Extracted');

                                                    fs.readFile("extractedPatchNotes.txt", 'utf8', function (err, data) {
                                                        let patchText = data;

                                                        zip.close()
                                                        fs.unlinkSync("patchNotes.zip");
                                                        fs.unlinkSync("extractedPatchNotes.txt");

                                                        botManager.isCheckingPatchNotes = false;
                                                        callback([patchDescription, patchText, patchURL]);
                                                    });
                                                })
                                                break;
                                            }
                                        }
                                    })
                                })
                            } else {
                                botManager.isCheckingPatchNotes = false;
                                callback(null);
                            }
                        })
                    } else {
                        botManager.isCheckingPatchNotes = false;
                        callback(null);
                    }
                } else {
                    botManager.isCheckingPatchNotes = false;
                    callback(null);
                }
            })
        }
    }

    copyFile(source, target) {
        let rd = fs.createReadStream(source);
        let wr = fs.createWriteStream(target);
        return new Promise(function (resolve, reject) {
            rd.on('error', reject);
            wr.on('error', reject);
            wr.on('finish', resolve);
            rd.pipe(wr);
        }).catch(function (error) {
            rd.destroy();
            wr.end();
            throw error;
        });
    }
}

module.exports = BedrockUpdateBotManager;