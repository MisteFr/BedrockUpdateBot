const yaml_config = require('node-yaml');
const fs = require('fs');
const getUrls = require('get-urls');
const https = require('https');
const StreamZip = require('node-stream-zip');
const JsDiff = require('diff');
const github = require('octonode');

require('./../BedrockUpdateBot.js');

class Decompiler {

    static checkMessage(message) {
        if (message.author.username == "MCPE Google Play Updates" && message.channel.name == "updates") {
            if (message.content.includes("APK file now available for com.mojang.minecraftpe " + botManager.config["lastVersionReleased"]) && message.content.includes("arm")) {
                botManager.createNewConsoleMessage();
                var date = Date.now();
                var url = Array.from(getUrls(message.content))[0];
                botManager.updateConsole('Starting...');
                var download = function (url, dest, firstUrl = false, cb) {
                    console.log(firstUrl ? 'Downloading the displayed HTML to get the real download link...' : 'Downloading the APK...');
                    var file = fs.createWriteStream(dest);
                    var request = https.get(url, function (response) {
                        response.pipe(file);
                        file.on('finish', function () {
                            console.log(firstUrl ? 'Displayed HTML downloaded !' : 'APK downloaded !');
                            file.close(cb);
                            if (firstUrl) {

                                try {
                                    yaml_config.readSync(botManager.config["lastVersionReleasedIsBeta"] ? "./../../" + botManager.config["lastVersionAndroidBeta"] + ".yml" : "./../../" + botManager.config["lastVersionAndroid"] + ".yml");
                                }
                                catch (error) {
                                    console.log("Getting an anti robot check, retrying")
                                    return download(url, botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta"] + ".yml" : botManager.config["lastVersionAndroid"] + ".yml", true, function foo() { }) //we don't need a callback but there must be one
                                }

                                var realUrl = Array.from(getUrls(yaml_config.readSync(botManager.config["lastVersionReleasedIsBeta"] ? "./../../" + botManager.config["lastVersionAndroidBeta"] + ".yml" : "./../../" + botManager.config["lastVersionAndroid"] + ".yml")))[0];
                                download(realUrl, botManager.config["lastVersionReleasedIsBeta"] ? "MCPE/Beta/" + botManager.config["lastVersionAndroidBeta"] + "/" + botManager.config["lastVersionAndroidBeta"] + ".apk" : "MCPE/Release/" + botManager.config["lastVersionAndroid"] + "/" + botManager.config["lastVersionAndroid"] + ".apk", false, function foo() { }) //we don't need a callback but there must be one
                            } else {
                                fs.unlinkSync(botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta"] + ".yml" : botManager.config["lastVersionAndroid"] + ".yml");
                                fs.rename(botManager.config["lastVersionReleasedIsBeta"] ? "MCPE/Beta/" + botManager.config["lastVersionAndroidBeta"] + "/" + botManager.config["lastVersionAndroidBeta"] + ".apk" : "MCPE/Release/" + botManager.config["lastVersionAndroid"] + "/" + botManager.config["lastVersionAndroid"] + ".apk", botManager.config["lastVersionReleasedIsBeta"] ? "MCPE/Beta/" + botManager.config["lastVersionAndroidBeta"] + "/" + botManager.config["lastVersionAndroidBeta"] + ".apk.zip" : "MCPE/Release/" + botManager.config["lastVersionAndroid"] + "/" + botManager.config["lastVersionAndroid"] + ".apk.zip", function (err) {
                                    if (err) console.log('ERROR: ' + err);
                                });
                                console.log("Accessing to the .apk..")
                                const zip = new StreamZip({
                                    file: botManager.config["lastVersionReleasedIsBeta"] ? "MCPE/Beta/" + botManager.config["lastVersionAndroidBeta"] + "/" + botManager.config["lastVersionAndroidBeta"] + ".apk.zip" : "MCPE/Release/" + botManager.config["lastVersionAndroid"] + "/" + botManager.config["lastVersionAndroid"] + ".apk.zip",
                                    storeEntries: true
                                });

                                zip.on('ready', () => {
                                    console.log('Entries read in the apk: ' + zip.entriesCount);
                                    for (const entry of Object.values(zip.entries())) {
                                        if (entry.name == "assets/profanity_filter.wlist") {
                                            if (entry.size !== botManager.config["profanityFilterSize"]) {
                                                zip.extract('assets/profanity_filter.wlist', botManager.config["lastVersionReleasedIsBeta"] ? "MCPE/Beta/" + botManager.config["lastVersionAndroidBeta"] + "/" + botManager.config["lastVersionAndroidBeta"] + "_profanity_filter.wlist" : "MCPE/Release/" + botManager.config["lastVersionAndroid"] + "/" + botManager.config["lastVersionAndroid"] + "_profanity_filter.wlist", err => {
                                                    console.log(err ? 'Extract error' : 'Extracting profanity_filter.wlist');
                                                    console.log("Profanity filter was updated ! (" + botManager.config["profanityFilterSize"] + " to " + entry.size + " bytes)");
                                                    botManager.updateConsole("Profanity filter was updated ! (" + botManager.config["profanityFilterSize"] + " to " + entry.size + " bytes)");
                                                    botManager.config["profanityFilterSize"] = entry.size;
                                                    botManager.saveConfig()
                                                })
                                            }
                                        }
                                        if (entry.name == "lib/armeabi-v7a/libminecraftpe.so") {
                                            zip.extract('lib/armeabi-v7a/libminecraftpe.so', botManager.config["lastVersionReleasedIsBeta"] ? "MCPE/Beta/" + botManager.config["lastVersionAndroidBeta"] + "/" + botManager.config["lastVersionAndroidBeta"] + ".so" : "MCPE/Release/" + botManager.config["lastVersionAndroid"] + "/" + botManager.config["lastVersionAndroid"] + ".so", err => {
                                                botManager.updateConsole(err ? 'Extract error' : 'Extracting libminecraftpe.so');
                                                zip.close();
                                                console.log('Getting the packets list');
                                                const { exec } = require('child_process');
                                                exec(botManager.config["lastVersionReleasedIsBeta"] ? "python packets.py MCPE/Beta/" + botManager.config["lastVersionAndroidBeta"] + "/" + botManager.config["lastVersionAndroidBeta"] + ".so" : "python packets.py MCPE/Release/" + botManager.config["lastVersionAndroid"] + "/" + botManager.config["lastVersionAndroid"] + ".so", { maxBuffer: 1024 * 500 }, (err, stdout, stderr) => {
                                                    if (err) {
                                                        console.log(err.message)
                                                        return;
                                                    }

                                                    var firstPart = stdout.split("----------")[0];
                                                    var secondPart = stdout.split("----------")[1];

                                                    var PacketArray = firstPart.split('_BASE        _');
                                                    for (var i = 0; i < PacketArray.length; ++i) {
                                                        PacketArray[i] = ((PacketArray[i].replace(/(\r\n|\n|\r)/gm, "")).replace(/\s/g, '')).replace(";", "");
                                                    }
                                                    var packetCount = (i - 1);
                                                    PacketArray = PacketArray.filter(v => v != '');

                                                    console.log('Comparing the packet list with the latest packet list ' + (botManager.config["lastVersionReleasedIsBeta"] ? "coming from the beta " + botManager.config["lastVersionAndroidBeta2"] + " because this version is a beta version." : "coming from the release " + botManager.config["lastVersionAndroid2"] + " because this version is a release version."));

                                                    var newPacketsNameToId = [];
                                                    var oldPacketsNameToId = [];

                                                    PacketArray.forEach(function (element) {
                                                        newPacketsNameToId[element.split('=')[0]] = (element.split('=')[1]).replace(";", "");
                                                    })

                                                    if (botManager.config["lastVersionReleasedIsBeta"]) {
                                                        var OldPacketsArray = botManager.config["packetListBeta"];
                                                    } else {
                                                        var OldPacketsArray = botManager.config["packetListRelease"];
                                                    }

                                                    OldPacketsArray.forEach(function (element) {
                                                        oldPacketsNameToId[element.split('=')[0]] = element.split('=')[1];
                                                    })


                                                    var oldPacketNames = [];
                                                    var newPacketsNames = [];
                                                    var someAdded = false;
                                                    var someRemoved = false;

                                                    for (var key in oldPacketsNameToId) {
                                                        oldPacketNames.push(key)
                                                    }

                                                    for (var key in newPacketsNameToId) {
                                                        newPacketsNames.push(key)
                                                    }

                                                    var Added = [];

                                                    newPacketsNames.forEach(function (element) {
                                                        var found = false;
                                                        oldPacketNames.forEach(function (toCheckIn) {
                                                            if (element == toCheckIn) {
                                                                found = true;
                                                            }
                                                        })
                                                        if (found == false) {
                                                            Added[element] = newPacketsNameToId[element];
                                                            someAdded = true;
                                                        }
                                                    })



                                                    var Removed = [];


                                                    oldPacketNames.forEach(function (element) {
                                                        var found = false;
                                                        newPacketsNames.forEach(function (toCheckIn) {
                                                            if (element == toCheckIn) {
                                                                found = true;
                                                            }
                                                        })
                                                        if (found == false) {
                                                            Removed[element] = oldPacketsNameToId[element];
                                                            someRemoved = true;
                                                        }
                                                    })

                                                    var fixedText = "";

                                                    if (someAdded == true) {
                                                        fixedText = fixedText + "\n" + "There are some packets added in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                                        console.log('Found new packet(s) !');
                                                        console.log(Added)
                                                        botManager.updateConsole('\nFound new packet(s) !');
                                                        botManager.sendToChannels('pmmp', 'Found new packet(s) in ' + botManager.config['lastVersionReleased'] + ".")
                                                        for (var key in Added) {
                                                            var value = Added[key];
                                                            botManager.updateConsole('   - ' + key + ' (' + value + ')');
                                                            botManager.sendToChannels('pmmp', '   - ' + key + ' (' + value + ')')
                                                            fixedText = fixedText + "\n" + "    - " + key + " (" + value + ")"
                                                        }
                                                    } else {
                                                        console.log('There is no packets added');
                                                        botManager.updateConsole('\nThere are no packets added');
                                                        botManager.sendToChannels('pmmp', 'There are no packets added in ' + botManager.config['lastVersionReleased'] + ".")
                                                        fixedText = fixedText + "\n" + "There are no packets added in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                                    }

                                                    if (someRemoved == true) {
                                                        fixedText = fixedText + "\n" + "There are some packets removed in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                                        console.log('There is some removed packet(s) !');
                                                        console.log(Removed)
                                                        botManager.updateConsole('\nThere are some removed packet(s) !');
                                                        botManager.sendToChannels('pmmp', 'There are some packets removed in ' + botManager.config['lastVersionReleased'] + ".")
                                                        for (var key in Removed) {
                                                            var value = Removed[key];
                                                            botManager.updateConsole('   - ' + key + ' (' + value + ')');
                                                            botManager.sendToChannels('pmmp', '   - ' + key + ' (' + value + ')')
                                                            fixedText = fixedText + "\n" + "    - " + key + " (" + value + ")"
                                                        }
                                                    } else {
                                                        console.log('There are no packets removed');
                                                        botManager.updateConsole('\nThere are no packets removed');
                                                        botManager.sendToChannels('pmmp', 'There are no packets removed in ' + botManager.config['lastVersionReleased'] + ".")
                                                        fixedText = fixedText + "\n" + "There are no packets removed in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                                    }



                                                    console.log('Saving the packet list to the config');

                                                    if (botManager.config["lastVersionReleasedIsBeta"]) {
                                                        botManager.config["packetListBeta"] = PacketArray;
                                                    } else {
                                                        botManager.config["packetListRelease"] = PacketArray;
                                                    }
                                                    botManager.saveConfig()

                                                    var additionalInfosOfPackets = secondPart.split('~~~');

                                                    if (someAdded == true) {

                                                        additionalInfosOfPackets.forEach(function (sectionTextPart) {
                                                            for (var key in Added) {
                                                                var value = Added[key];
                                                                if (sectionTextPart.includes(value) && sectionTextPart.includes(botManager.titleCase((key.replace(/_/g, " "))))) {
                                                                    botManager.channelToDebugMcpe.send(sectionTextPart)
                                                                }
                                                            }
                                                        })
                                                    }


                                                    if (botManager.config["lastVersionReleasedIsBeta"]) {
                                                        var oldSecondPart = botManager.config["packetInfoBeta"];
                                                    } else {
                                                        var oldSecondPart = botManager.config["packetInfoRelease"];
                                                    }

                                                    var oldAdditionalInfosOfPackets = oldSecondPart.split('~~~');

                                                    additionalInfosOfPackets.forEach(function (sectionTextPart) {
                                                        var newId = sectionTextPart.match(new RegExp('PacketID:' + '\\s(\\w+)'));
                                                        if (newId !== null) {
                                                            newId = newId[1];
                                                        }
                                                        oldAdditionalInfosOfPackets.forEach(function (oldSectionTextPart) {
                                                            var oldId = oldSectionTextPart.match(new RegExp('PacketID:' + '\\s(\\w+)'));
                                                            if (oldId !== null) {
                                                                oldId = oldId[1];
                                                            }
                                                            if (newId !== null && oldId !== null && newId == oldId) {
                                                                if (sectionTextPart !== oldSectionTextPart) {
                                                                    var diff = JsDiff.diffLines(oldSectionTextPart, sectionTextPart);
                                                                    diff.forEach(function (part) {
                                                                        if (part.added !== undefined || part.removed !== undefined) {
                                                                            if (part.added !== undefined && part.value !== undefined) {
                                                                                if (part.value.includes("BinaryStream") && (part.value.includes("getB") || part.value.includes("writeB") || part.value.includes("writeF") || part.value.includes("writeN") || part.value.includes("writeS") || part.value.includes("writeU") || part.value.includes("writeV") || part.value.includes("getD") || part.value.includes("getF") || part.value.includes("getI") || part.value.includes("getS") || part.value.includes("getT") || part.value.includes("getV") || part.value.includes('getU'))) {
                                                                                    for (var i in oldPacketsNameToId) {
                                                                                        if (oldPacketsNameToId[i] == oldId) {
                                                                                            var packetName = i;
                                                                                        }
                                                                                    }
                                                                                    botManager.channelToDebugMcpe.send("Detected something added in " + botManager.titleCase((packetName.replace(/_/g, " "))) + " (" + newId + ")\n\n```\n" + part.value + "\n```")
                                                                                    botManager.sendToChannels('pmmp', "Detected something added in " + botManager.titleCase((packetName.replace(/_/g, " "))) + " (" + newId + ")\n\n```\n" + part.value + "\n```")
                                                                                    fixedText = fixedText + "Detected something added in " + botManager.titleCase((packetName.replace(/_/g, " "))) + " (" + newId + ")\n\n```\n" + part.value + "\n```";
                                                                                }
                                                                            } else if (part.removed !== undefined && part.value !== undefined) {
                                                                                if (part.value.includes("BinaryStream") && (part.value.includes("getB") || part.value.includes("writeB") || part.value.includes("writeF") || part.value.includes("writeN") || part.value.includes("writeS") || part.value.includes("writeU") || part.value.includes("writeV") || part.value.includes("getD") || part.value.includes("getF") || part.value.includes("getI") || part.value.includes("getS") || part.value.includes("getT") || part.value.includes("getV") || part.value.includes('getU'))) {
                                                                                    for (var i in oldPacketsNameToId) {
                                                                                        if (oldPacketsNameToId[i] == oldId) {
                                                                                            var packetName = i;
                                                                                        }
                                                                                    }
                                                                                    botManager.channelToDebugMcpe.send("Detected something removed in " + botManager.titleCase((packetName.replace(/_/g, " "))) + " (" + newId + ")\n\n```\n" + part.value + "\n```")
                                                                                    botManager.sendToChannels('pmmp', "Detected something removed in " + botManager.titleCase((packetName.replace(/_/g, " "))) + " (" + newId + ")\n\n```\n" + part.value + "\n```")
                                                                                    fixedText = fixedText + "Detected something removed in " + botManager.titleCase((packetName.replace(/_/g, " "))) + " (" + newId + ")\n\n```\n" + part.value + "\n```";
                                                                                }
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        })
                                                    })

                                                    console.log('Saving the write&read methods for each packets to config');
                                                    if (botManager.config["lastVersionReleasedIsBeta"]) {
                                                        botManager.config["packetInfoBeta"] = secondPart;
                                                    } else {
                                                        botManager.config["packetInfoRelease"] = secondPart;
                                                    }

                                                    botManager.saveConfig()

                                                    console.log(botManager.config["lastVersionReleasedIsBeta"] ? "Found " + packetCount + " packets in this version (" + botManager.config["lastVersionAndroidBeta"] + ") !" : "Found " + i + " packets in this version (" + botManager.config["lastVersionAndroid"] + ") !")
                                                    console.log("Time took by the operation: " + ((Date.now() - date) / 1000) + " secs")

                                                    botManager.updateConsole(botManager.config["lastVersionReleasedIsBeta"] ? "\nFound " + packetCount + " packets in this version (" + botManager.config["lastVersionAndroidBeta"] + ") !" : "\nFound " + i + " packets in this version (" + botManager.config["lastVersionAndroid"] + ") !")
                                                    botManager.updateConsole("Time took by the operation: " + ((Date.now() - date) / 1000) + " secs" + ".")


                                                    console.log('Authentificating to github');

                                                    var githubClient = github.client(botManager.config['githubToken']);

                                                    var toFilter = secondPart.split('\n');

                                                    for (var i = 0; i < toFilter.length; i++) {
                                                        if ((toFilter[i].includes("BinaryStream") && (toFilter[i].includes("getB") || toFilter[i].includes("writeB") || toFilter[i].includes("writeF") || toFilter[i].includes("writeN") || toFilter[i].includes("writeS") || toFilter[i].includes("writeU") || toFilter[i].includes("writeV") || toFilter[i].includes("getD") || toFilter[i].includes("getF") || toFilter[i].includes("getI") || toFilter[i].includes("getS") || toFilter[i].includes("getT") || toFilter[i].includes("getV") || toFilter[i].includes("getU"))) || toFilter[i].includes('# ') || toFilter[i].includes("```")) {
                                                            if (toFilter[i].includes("#")) {
                                                                fixedText = fixedText + "\n\n" + toFilter[i].replace("@plt", "");
                                                            } else {
                                                                fixedText = fixedText + "\n" + toFilter[i].replace("@plt", "");
                                                            }
                                                        }
                                                    }


                                                    console.log('Posting on github the protocol documentation..');
                                                    githubClient.repo('MisteFr/minecraft-protocol-documentation').createContents((botManager.config["lastVersionReleasedIsBeta"] ? "beta/" + botManager.config["lastVersionAndroidBeta"] + ".md" : "release/" + botManager.config["lastVersionAndroid"] + ".md"), (botManager.config["lastVersionReleasedIsBeta"] ? "Adding protocol bump from " + botManager.config["lastVersionAndroidBeta"] + "." : "Adding protocol bump from " + botManager.config["lastVersionAndroid"] + "."), fixedText, (err, data) => {
                                                        if (err) {
                                                            botManager.updateConsole('\nError while trying to update the protocol documentation of this version (' + botManager.config['lastVersionReleased'] + '). Error message: ' + err.message);
                                                            return console.error(err);
                                                        }
                                                        console.log(data.content.html_url);
                                                        botManager.sendToChannels('pmmp', 'Uploaded the protocol documentation of ' + botManager.config['lastVersionReleased'] + ' here: ' + data.content.html_url + ".")
                                                        botManager.channelToDebugMcpe.send('Uploaded the protocol documentation of ' + botManager.config['lastVersionReleased'] + ' here: ' + data.content.html_url + ".")
                                                    });


                                                    console.log("Extracting symbols of this version")

                                                    exec(botManager.config["lastVersionReleasedIsBeta"] ? "readelf -Ws MCPE/Beta/" + botManager.config["lastVersionAndroidBeta"] + "/" + botManager.config["lastVersionAndroidBeta"] + ".so" : "readelf -Ws MCPE/Release/" + botManager.config["lastVersionAndroid"] + "/" + botManager.config["lastVersionAndroid"] + ".so", { maxBuffer: 2048 * 10000 }, (err, stdout, stderr) => {
                                                        if (err) {
                                                            console.log(err.message)
                                                            return;
                                                        }

                                                        var newSymbolArrayNameToAddress = [];
                                                        var newSymbolList = (stdout.split("Ndx Name")[1]).split("\n");

                                                        newSymbolList.forEach(function (element) {
                                                            var subArray = botManager.cleanArray((element.split(" ")));
                                                            if (subArray[7] !== undefined && subArray[1] !== undefined) {
                                                                newSymbolArrayNameToAddress[subArray[7]] = subArray[1].toString();
                                                            }
                                                        })


                                                        var oldSymbolArrayNameToAddress = [];
                                                        if (botManager.config["lastVersionReleasedIsBeta"] === true) {
                                                            var oldSymbolList = (botManager.config["symbolsListBeta"].split("Ndx Name")[1]).split("\n");
                                                        } else {
                                                            var oldSymbolList = (botManager.config["symbolsListRelease"].split("Ndx Name")[1]).split("\n");
                                                        }

                                                        oldSymbolList.forEach(function (element) {
                                                            var subArray = botManager.cleanArray((element.split(" ")));
                                                            if (subArray[7] !== undefined && subArray[1] !== undefined) {
                                                                oldSymbolArrayNameToAddress[subArray[7]] = subArray[1].toString();
                                                            }
                                                        })


                                                        var Added = [];
                                                        var someAdded = false;

                                                        for (var element in newSymbolArrayNameToAddress) {
                                                            if (!oldSymbolArrayNameToAddress.hasOwnProperty(element)) {
                                                                Added[element] = newSymbolArrayNameToAddress[element];
                                                                someAdded = true;
                                                            }
                                                        }

                                                        var Removed = [];
                                                        var someRemoved = false;

                                                        for (var element in oldSymbolArrayNameToAddress) {
                                                            if (!newSymbolArrayNameToAddress.hasOwnProperty(element)) {
                                                                Removed[element] = oldSymbolArrayNameToAddress[element];
                                                                someRemoved = true;
                                                            }
                                                        }

                                                        var textToPublish = "";

                                                        if (someRemoved !== false || someAdded !== false) {
                                                            if (someAdded === true) {
                                                                textToPublish = textToPublish + "\n" + "There are some new symbols added in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                                                console.log('Found new symbols !');
                                                                console.log(Added)
                                                                textToPublish = textToPublish + "\n" + "```";
                                                                for (var key in Added) {
                                                                    var value = Added[key];
                                                                    textToPublish = textToPublish + "\n" + "    - " + key + " (Address: " + value + ")"
                                                                }
                                                                textToPublish = textToPublish + "\n" + "```";
                                                            } else {
                                                                textToPublish = textToPublish + "\n" + "There are no symbols added in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                                            }

                                                            if (someRemoved === true) {
                                                                textToPublish = textToPublish + "\n" + "There are some new symbols removed in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                                                console.log('Found new symbols !');
                                                                console.log(Added)
                                                                textToPublish = textToPublish + "\n" + "```";
                                                                for (var key in Added) {
                                                                    var value = Added[key];
                                                                    textToPublish = textToPublish + "\n" + "    - " + key + " (Address: " + value + ")"
                                                                }
                                                                textToPublish = textToPublish + "\n" + "```";
                                                            } else {
                                                                textToPublish = textToPublish + "\n" + "There are no symbols removed in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                                            }
                                                        } else {
                                                            textToPublish = textToPublish + "\n" + "There are no symbols added and removed in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                                        }


                                                        githubClient.repo('MisteFr/minecraft-symbols-dumps').createContents((botManager.config["lastVersionReleasedIsBeta"] ? "beta/" + botManager.config["lastVersionAndroidBeta"] + "_dump.md" : "release/" + botManager.config["lastVersionAndroid"] + "_dump.md"), (botManager.config["lastVersionReleasedIsBeta"] ? "Adding symbols bump from " + botManager.config["lastVersionAndroidBeta"] + "." : "Adding symbols bump from " + botManager.config["lastVersionAndroid"] + "."), stdout, (err, data) => {
                                                            if (err) {
                                                                botManager.updateConsole('\nError while trying to update the symbols dump of this version (' + botManager.config['lastVersionReleased'] + '). Error message: ' + err.message);
                                                                return console.error(err);
                                                            } else {
                                                                console.log(data.content.html_url);
                                                                githubClient.repo('MisteFr/minecraft-symbols-dumps').createContents((botManager.config["lastVersionReleasedIsBeta"] ? "beta/" + botManager.config["lastVersionAndroidBeta"] + ".md" : "release/" + botManager.config["lastVersionAndroid"] + ".md"), (botManager.config["lastVersionReleasedIsBeta"] ? "Adding symbols diff from " + botManager.config["lastVersionAndroidBeta"] + "." : "Adding symbols diff from " + botManager.config["lastVersionAndroid"] + "."), textToPublish, (err, data) => {
                                                                    if (err) {
                                                                        botManager.updateConsole('\nError while trying to update the symbols infos of this version (' + botManager.config['lastVersionReleased'] + '). Error message: ' + err.message);
                                                                        return console.error(err);
                                                                    }
                                                                    console.log(data.content.html_url);
                                                                    botManager.sendToChannels('pmmp', 'Uploaded the symbols diff & symbol dump of ' + botManager.config['lastVersionReleased'] + ' here: ' + data.content.html_url)
                                                                    botManager.channelToDebugMcpe.send('Uploaded the symbols diff & symbol dump of ' + botManager.config['lastVersionReleased'] + ' here: ' + data.content.html_url)
                                                                });
                                                            }
                                                        });

                                                        if (botManager.config["lastVersionReleasedIsBeta"] === true) {
                                                            botManager.config["symbolsListBeta"] = stdout;
                                                        } else {
                                                            botManager.config["symbolsListRelease"] = stdout;
                                                        }

                                                        botManager.saveConfig()

                                                    })
                                                });
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    });
                }
                download(url, botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta"] + ".yml" : botManager.config["lastVersionAndroid"] + ".yml", true, function foo() { }) //we don't need a callback but there must be one
            }
        }
    }
}

module.exports = Decompiler;