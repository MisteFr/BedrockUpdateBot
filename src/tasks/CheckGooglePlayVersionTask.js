require('./../BedrockUpdateBot.js')
const Discord = require('discord.js');
const fs = require('fs');
var client = require('scp2')
class CheckGooglePlayVersionTask {
    static getDelay() {
        return 300000; //5 mins
    }

    static getName() {
        return "CheckGooglePlayVersionTask";
    }

    static check(Bot) {
        /*
            Initializing them in the botManager corrupt the object for some reasons
        */
        var betaAccount = require('gpapi').GooglePlayAPI({
            username: botManager.config["betaAccount"]["username"],
            password: botManager.config["betaAccount"]["password"],
            androidId: botManager.config["betaAccount"]["androidId"],
            useCache: false,
            debug: false
        });

        var normalAccount = require('gpapi').GooglePlayAPI({
            username: botManager.config["normalAccount"]["username"],
            password: botManager.config["normalAccount"]["password"],
            androidId: botManager.config["normalAccount"]["androidId"],
            useCache: false,
            debug: false
        });

        betaAccount.bulkDetails("com.mojang.minecraftpe", function (err, res) {
            if (res !== undefined) {
                var betaVersion = res[0].details.appDetails.versionString;
                var betaVersionCode = res[0].details.appDetails.versionCode;

                if ((betaVersion + "_beta") !== botManager.config["lastVersionAndroidBeta"] && (betaVersion + "_beta") !== botManager.config["lastVersionAndroidBeta2"]) {
                    console.log("betaVersion: " + betaVersion)
                    botManager.config["lastVersionAndroidBeta2"] = botManager.config["lastVersionAndroidBeta"];
                    botManager.config["lastVersionAndroidBeta"] = (betaVersion + "_beta");
                    botManager.config["lastVersionReleased"] = (betaVersion + "_beta");
                    botManager.config["lastVersionReleasedIsBeta"] = true;
                    botManager.saveConfig()
                    var embed = new Discord.RichEmbed()
                        .setTitle(`A new version is out on the Google Play Store for beta users: ` + betaVersion + " :pushpin:")
                        .setDescription(res[0].details.appDetails.recentChangesHtml.replace(/<br\s*\/?>/gi, ' '))
                        .setColor('#0941a9')

                    botManager.client.post('statuses/update', { status: '📌 A new version is out on the Google Play Store for beta users: ' + betaVersion + " !\n\n#RT" }, function (error, tweet, response) {
                        botManager.sendToChannels('news', embed)
                        botManager.sendToChannels('debug', "A new version is out on the GooglePlayStore for beta users! (" + betaVersion + ") ")
                    });


                    if (!fs.existsSync("MCPE/Beta/" + betaVersion + "_beta/")) {
                        fs.mkdirSync("MCPE/Beta/" + betaVersion + "_beta/")
                    }
                    var fStream = fs.createWriteStream("MCPE/Beta/" + betaVersion + "_beta/" + betaVersion + "_beta.apk");

                    fStream.on('open', function () {
                        betaAccount.download("com.mojang.minecraftpe", betaVersionCode).then(function (res) {
                            res.pipe(fStream);
                            client.scp(betaVersion + "_beta.apk", {
                                host: botManager.config["localHOST"],
                                username: botManager.config["localUSER"],
                                password: botManager.config["localPASS"],
                                path: '/media/HDD/MCPE/Release'
                            }, function(err) {
                                console.log(err)
                            })
                        });
                    })

                    fStream.on('finish', function () {
                        require('./../disassembly/MinecraftDisassembly.js').run(betaVersion);
                        betaAccount.details("com.mojang.minecraftpe", function (err, res) {
                            var configStream = fs.createWriteStream("MCPE/Beta/" + betaVersion + "_beta/" + betaVersion + "_beta.json");
                            configStream.on('open', function () {
                                fs.writeFile("MCPE/Beta/" + betaVersion + "_beta/" + betaVersion + "_beta.json", JSON.stringify(res, null, 4), 'utf8', function foo() { });
                            })
                        })
                    })
                }
            }
        });


        normalAccount.bulkDetails("com.mojang.minecraftpe", function (err, res) {
            if (res !== undefined) {
                var normalVersion = res[0].details.appDetails.versionString;
                var normalVersionCode = res[0].details.appDetails.versionCode;

                if (normalVersion !== botManager.config["lastVersionAndroid"] && normalVersion !== botManager.config["lastVersionAndroid2"]) {
                    console.log("normalVersion: " + normalVersion)
                    botManager.config["lastVersionAndroid2"] = botManager.config["lastVersionAndroid"];
                    botManager.config["lastVersionAndroid"] = normalVersion;
                    botManager.config["lastVersionReleased"] = normalVersion;
                    botManager.config["lastVersionReleasedIsBeta"] = false;
                    botManager.saveConfig()
                    var embed = new Discord.RichEmbed()
                        .setTitle(`A new version is out on the Google Play Store: ` + botManager.config["lastVersionAndroid"] + " :pushpin:")
                        .setDescription(res[0].details.appDetails.recentChangesHtml.replace(/<br\s*\/?>/gi, ' '))
                        .setColor('#0941a9')

                    botManager.client.post('statuses/update', { status: '📌 A new version is out on the Google Play Store: ' + normalVersion + " !\n\n#RT" }, function (error, tweet, response) {
                        botManager.sendToChannels('news', embed)
                        botManager.sendToChannels('debug', "A new version is out on the GooglePlayStore ! (" + botManager.config["lastVersionAndroid"] + ") ")
                    });

                    if (!fs.existsSync("MCPE/Release/" + normalVersion + "/")) {
                        fs.mkdirSync("MCPE/Release/" + normalVersion + "/")
                    }
                    var fStream = fs.createWriteStream("MCPE/Release/" + normalVersion + "/" + normalVersion + ".apk");

                    fStream.on('open', function () {
                        betaAccount.download("com.mojang.minecraftpe", normalVersionCode).then(function (res) {
                            res.pipe(fStream);
                            client.scp(normalVersion + ".apk", {
                                host: botManager.config["localHOST"],
                                username: botManager.config["localUSER"],
                                password: botManager.config["localPASS"],
                                path: '/media/HDD/MCPE/Beta'
                            }, function(err) {
                                console.log(err)
                            })
                        });
                    })

                    fStream.on('finish', function () {
                        require('./../disassembly/MinecraftDisassembly.js').run(normalVersion);
                    })

                    normalAccount.details("com.mojang.minecraftpe", function (err, res) {
                        var configStream = fs.createWriteStream("MCPE/Release/" + normalVersion + "/" + normalVersion + ".json");
                        configStream.on('open', function () {
                            fs.writeFile("MCPE/Release/" + normalVersion + "/" + normalVersion + ".json", JSON.stringify(res, null, 4), 'utf8', function foo() { });
                        })
                    })
                }
            }
        });
    }
}

module.exports = CheckGooglePlayVersionTask;