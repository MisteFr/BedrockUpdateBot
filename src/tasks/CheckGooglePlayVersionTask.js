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
            username: botManager.loginConfig["betaAccount"]["username"],
            password: botManager.loginConfig["betaAccount"]["password"],
            androidId: botManager.loginConfig["betaAccount"]["androidId"],
            useCache: false,
            debug: false
        });

        var normalAccount = require('gpapi').GooglePlayAPI({
            username: botManager.loginConfig["normalAccount"]["username"],
            password: botManager.loginConfig["normalAccount"]["password"],
            androidId: botManager.loginConfig["normalAccount"]["androidId"],
            useCache: false,
            debug: false
        });

        betaAccount.bulkDetails("com.mojang.minecraftpe", function (err, res) {
            if(res){
                console.log(res)
                if (res[0] !== null) {

                    var betaVersion = res[0].details.appDetails.versionString;
                    var betaVersionCode = res[0].details.appDetails.versionCode;
    
    
                    if ((betaVersion + "_beta") !== botManager.config["lastVersionAndroidBeta"] && (betaVersion + "_beta") !== botManager.config["lastVersionAndroidBeta2"]) {
                        botManager.config["lastVersionAndroidBeta2"] = botManager.config["lastVersionAndroidBeta"];
                        botManager.config["lastVersionAndroidBeta"] = (betaVersion + "_beta");
                        botManager.config["lastVersionReleased"] = (betaVersion + "_beta");
                        botManager.config["lastVersionReleasedIsBeta"] = true;
                        botManager.saveConfig()
    
                        
                        var embed = new Discord.MessageEmbed()
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
                            client.scp("/home/MisteBot/MCPE/Beta/" + betaVersion + "_beta/" + betaVersion + "_beta.apk.zip", {
                                host: botManager.loginConfig["localHOST"],
                                username: botManager.loginConfig["localUSER"],
                                password: botManager.loginConfig["localPASS"],
                                path: '/media/HDD/MCPE/Beta/' + betaVersion + '_beta.apk'
                            }, function(err) {
                                if(err){
                                    botManager.channelToDebugMcpe.send('Error while uploading the apk.')
                                    console.log(err)
                                }else{
                                    botManager.channelToDebugMcpe.send('APK (armeabi-v7a) available here: http://77.132.168.75/MCPE/Beta/' + betaVersion + '_beta.apk')
                                }
                            })
                        })
                    }
                }
            }
        });


        normalAccount.bulkDetails("com.mojang.minecraftpe", function (err, res) {
            if(res){
                if (res[0] !== null) {
                    var normalVersion = res[0].details.appDetails.versionString;
                    var normalVersionCode = res[0].details.appDetails.versionCode;
                    /*
                    normalVersionCode = normalVersionCode.toString()
                    normalVersionCode = normalVersionCode.replace("8721", "8711")
                    normalVersionCode = new Number(normalVersionCode)
    
                    console.log(normalVersionCode)
                    */
    
                    if (normalVersion !== botManager.config["lastVersionAndroid"] && normalVersion !== botManager.config["lastVersionAndroid2"]) {
                        botManager.config["lastVersionAndroid2"] = botManager.config["lastVersionAndroid"];
                        botManager.config["lastVersionAndroid"] = normalVersion;
                        botManager.config["lastVersionReleased"] = normalVersion;
                        botManager.config["lastVersionReleasedIsBeta"] = false;
                        botManager.saveConfig()
    
                        var embed = new Discord.MessageEmbed()
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
                            });
                        })
    
                        fStream.on('finish', function () {
                            require('./../disassembly/MinecraftDisassembly.js').run(normalVersion);
                            client.scp("/home/MisteBot/MCPE/Release/" + normalVersion + "/" + normalVersion + ".apk.zip", {
                                host: botManager.loginConfig["localHOST"],
                                username: botManager.loginConfig["localUSER"],
                                password: botManager.loginConfig["localPASS"],
                                path: '/media/HDD/MCPE/Release/' + normalVersion + '.apk'
                            }, function(err) {
                                if(err){
                                    botManager.channelToDebugMcpe.send('Error while uploading the apk.')
                                    console.log(err)
                                }else{
                                    botManager.channelToDebugMcpe.send('APK (armeabi-v7a) available here: http://77.132.168.75/MCPE/Release/' + normalVersion + '.apk')
                                }
                            })
                        })
    
                        normalAccount.details("com.mojang.minecraftpe", function (err, res) {
                            var configStream = fs.createWriteStream("MCPE/Release/" + normalVersion + "/" + normalVersion + ".json");
                            configStream.on('open', function () {
                                fs.writeFile("MCPE/Release/" + normalVersion + "/" + normalVersion + ".json", JSON.stringify(res, null, 4), 'utf8', function foo() { });
                            })
                        })
                    }
                }
            }
        });
    }
}

module.exports = CheckGooglePlayVersionTask;