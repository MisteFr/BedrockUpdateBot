var yaml_config = require('node-yaml');
var fs = require('fs');
var getUrls = require('get-urls');
var https = require('https');
const StreamZip = require('node-stream-zip');
const JsDiff = require('diff');
require('./../BedrockUpdateBot.js');

class Decompiler {

    static checkMessage(message) {
        if (message.author.username == "MCPE Google Play Updates" && message.channel.name == "updates") {
            if (message.content.includes("APK file now available for com.mojang.minecraftpe " + botManager.config["lastVersionReleased"]) && message.content.includes("arm")) {
                botManager.createNewConsoleMessage();
                var date = Date.now();
                var url = Array.from(getUrls(message.content))[0];
                var download = function (url, dest, firstUrl = false, cb) {
                    console.log(firstUrl ? 'Downloading the displayed HTML to get the real download link...' : 'Downloading the APK...');
                    botManager.updateConsole(firstUrl ? 'Downloading the displayed HTML to get the real download link...' : 'Downloading the APK...');
                    var file = fs.createWriteStream(dest);
                    var request = https.get(url, function (response) {
                        response.pipe(file);
                        file.on('finish', function () {
                            console.log(firstUrl ? 'Displayed HTML downloaded !' : 'APK downloaded !');
                            botManager.updateConsole(firstUrl ? 'Displayed HTML downloaded !' : 'APK downloaded !');
                            file.close(cb);
                            if (firstUrl) {

                                try {
                                    yaml_config.readSync(botManager.config["lastVersionReleasedIsBeta"] ? "./../../" + botManager.config["lastVersionAndroidBeta"] + ".yml" : "./../../" + botManager.config["lastVersionAndroid"] + ".yml");
                                }
                                catch (error) {
                                    console.log(error)
                                    console.log("Getting an anti robot check, retrying")
                                    botManager.updateConsole("Getting an anti robot check, retrying")
                                    return download(url, botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta"] + ".yml" : botManager.config["lastVersionAndroid"] + ".yml", true, function foo(){}) //we don't need a callback but there must be one
                                }

                                var realUrl = Array.from(getUrls(yaml_config.readSync(botManager.config["lastVersionReleasedIsBeta"] ? "./../../" + botManager.config["lastVersionAndroidBeta"] + ".yml" : "./../../" + botManager.config["lastVersionAndroid"] + ".yml")))[0];
                                download(realUrl, botManager.config["lastVersionReleasedIsBeta"] ? "MCPE/Beta/" + botManager.config["lastVersionAndroidBeta"] + ".apk" : "MCPE/Release/" + botManager.config["lastVersionAndroid"] + ".apk", false, function foo(){}) //we don't need a callback but there must be one
                            } else {
                                fs.unlinkSync(botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta"] + ".yml" : botManager.config["lastVersionAndroid"] + ".yml");
                                fs.rename(botManager.config["lastVersionReleasedIsBeta"] ? "MCPE/Beta/" + botManager.config["lastVersionAndroidBeta"] + ".apk" : "MCPE/Release/" + botManager.config["lastVersionAndroid"] + ".apk", botManager.config["lastVersionReleasedIsBeta"] ? "MCPE/Beta/" + botManager.config["lastVersionAndroidBeta"] + ".apk.zip" : "MCPE/Release/" + botManager.config["lastVersionAndroid"] + ".apk.zip", function (err) {
                                    if (err) console.log('ERROR: ' + err);
                                });
                                console.log("Accessing to the .apk..")
                                botManager.updateConsole("Accessing to the .apk..")
                                const zip = new StreamZip({
                                    file: botManager.config["lastVersionReleasedIsBeta"] ? "MCPE/Beta/" + botManager.config["lastVersionAndroidBeta"] + ".apk.zip" : "MCPE/Release/" + botManager.config["lastVersionAndroid"] + ".apk.zip",
                                    storeEntries: true
                                });

                                zip.on('ready', () => {
                                    console.log('Entries read in the apk: ' + zip.entriesCount);
                                    botManager.updateConsole('Entries read in the apk: ' + zip.entriesCount);
                                    for (const entry of Object.values(zip.entries())) {
                                        if (entry.name == "assets/profanity_filter.wlist") {
                                            if (entry.size !== botManager.config["profanityFilterSize"]) {
                                                zip.extract('assets/profanity_filter.wlist', botManager.config["lastVersionReleasedIsBeta"] ? "MCPE/Beta/" + botManager.config["lastVersionAndroidBeta"] + "_profanity_filter.wlist" : "MCPE/Release/" + botManager.config["lastVersionAndroid"] + "_profanity_filter.wlist", err => {
                                                    console.log(err ? 'Extract error' : 'Extracting profanity_filter.wlist');
                                                    console.log("Profanity filter was updated ! (" + botManager.config["profanityFilterSize"] + " to " + entry.size + " bytes)");
                                                    botManager.updateConsole(err ? 'Extract error' : 'Extracting profanity_filter.wlist');
                                                    botManager.updateConsole("Profanity filter was updated ! (" + botManager.config["profanityFilterSize"] + " to " + entry.size + " bytes)");
                                                    botManager.config["profanityFilterSize"] = entry.size;
                                                    botManager.saveConfig()
                                                })
                                            }
                                        }
                                        if (entry.name == "lib/armeabi-v7a/libminecraftpe.so") {
                                            zip.extract('lib/armeabi-v7a/libminecraftpe.so', botManager.config["lastVersionReleasedIsBeta"] ? "MCPE/Beta/" + botManager.config["lastVersionAndroidBeta"] + ".so" : "MCPE/Release/" + botManager.config["lastVersionAndroid"] + ".so", err => {
                                                console.log(err ? 'Extract error' : 'Extracting libminecraftpe.so');
                                                botManager.updateConsole(err ? 'Extract error' : 'Extracting libminecraftpe.so');
                                                zip.close();
                                                console.log('Getting the packets list');
                                                botManager.updateConsole('Getting the packets list');
                                                const { exec } = require('child_process');
                                                exec(botManager.config["lastVersionReleasedIsBeta"] ? "python packets.py MCPE/Beta/" + botManager.config["lastVersionAndroidBeta"] + ".so" : "python packets.py MCPE/Release/" + botManager.config["lastVersionAndroid"] + ".so", { maxBuffer: 1024 * 500 }, (err, stdout, stderr) => {
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
                                                    PacketArray = PacketArray.filter(v => v != '');

                                                    console.log('Comparing the packet list with the latest packet list ' + (botManager.config["lastVersionReleasedIsBeta"] ? "coming from the beta " + botManager.config["lastVersionAndroidBeta2"] + " because this version is a beta version." : "coming from the release " + botManager.config["lastVersionAndroid2"] + " because this version is a release version."));
                                                    botManager.updateConsole('Comparing the packet list with the latest packet list ' + (botManager.config["lastVersionReleasedIsBeta"] ? "coming from the beta " + botManager.config["lastVersionAndroidBeta2"] + " because this version is a beta version." : "coming from the release " + botManager.config["lastVersionAndroid2"] + " because this version is a release version."));

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

                                                    if (someAdded == true) {
                                                        console.log('Found new packet(s) !');
                                                        console.log(Added)
                                                        botManager.updateConsole('\nFound new packet(s) !');
                                                        for (var key in Added) {
                                                            var value = Added[key];
                                                            botManager.updateConsole('   - ' + key + ' (' + value + ')');
                                                        }
                                                    } else {
                                                        console.log('There is no packets added');
                                                        botManager.updateConsole('\nThere is no packets added');
                                                    }

                                                    if (someRemoved == true) {
                                                        console.log('There is some removed packet(s) !');
                                                        console.log(Removed)
                                                        botManager.updateConsole('\nThere is some removed packet(s) !');
                                                        for (var key in Removed) {
                                                            var value = Removed[key];
                                                            botManager.updateConsole('   - ' + key + ' (' + value + ')');
                                                        }
                                                    } else {
                                                        console.log('There is no packets removed');
                                                        botManager.updateConsole('\nThere is no packets removed');
                                                    }


                                                    console.log('Saving the packet list to the config');
                                                    botManager.updateConsole('\nSaving the packet list to the config');

                                                    if (botManager.config["lastVersionReleasedIsBeta"]) {
                                                        botManager.config["packetListBeta"] = PacketArray;
                                                    } else {
                                                        botManager.config["packetListRelease"] = PacketArray;
                                                    }
                                                    botManager.saveConfig()

                                                    var additionalInfosOfPackets = secondPart.split('~~~');

                                                    if (someAdded == true) {
                                                        botManager.updateConsole("Extracting write/read methods for the new packets..")

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

                                                    botManager.updateConsole("Comparing write&read methods for each packets with the db from the last version..")
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
                                                                                if (part.value.includes("BinaryStream") && (part.value.includes("getB") || part.value.includes("writeB") || part.value.includes("writeF") || part.value.includes("writeN") || part.value.includes("writeS") || part.value.includes("writeU") || part.value.includes("writeV") || part.value.includes("getD") || part.value.includes("getF") || part.value.includes("getI") || part.value.includes("getS") || part.value.includes("getT") || part.value.includes("getV"))) {
                                                                                    botManager.channelToDebugMcpe.send("Detected something added in " + botManager.titleCase((oldPacketsNameToId[oldId].replace(/_/g, " "))) + " (" + newId + ")\n\n```\n" + new String(part.value).replace("```", "") + "\n```")
                                                                                }
                                                                            } else if (part.removed !== undefined && part.value !== undefined) {
                                                                                if (part.value.includes("BinaryStream") && (part.value.includes("getB") || part.value.includes("writeB") || part.value.includes("writeF") || part.value.includes("writeN") || part.value.includes("writeS") || part.value.includes("writeU") || part.value.includes("writeV") || part.value.includes("getD") || part.value.includes("getF") || part.value.includes("getI") || part.value.includes("getS") || part.value.includes("getT") || part.value.includes("getV"))) {
                                                                                    botManager.channelToDebugMcpe.send("Detected something removed in " + botManager.titleCase((oldPacketsNameToId[oldId].replace(/_/g, " "))) + " (" + newId + ")\n\n```\n" + new String(part.value).replace("```", "") + "\n```")
                                                                                }
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                            }
                                                        })
                                                    })

                                                    console.log('Saving the write&read methods for each packets to config');
                                                    botManager.updateConsole('\nSaving the write&read methods for each packets to config');
                                                    if (botManager.config["lastVersionReleasedIsBeta"]) {
                                                        botManager.config["packetInfoBeta"] = secondPart;
                                                    } else {
                                                        botManager.config["packetInfoRelease"] = secondPart;
                                                    }

                                                    botManager.saveConfig()


                                                    console.log(botManager.config["lastVersionReleasedIsBeta"] ? "Found " + i + " packets in this version (" + botManager.config["lastVersionAndroidBeta"] + ") !" : "Found " + i + " packets in this version (" + botManager.config["lastVersionAndroid"] + ") !")
                                                    console.log("Time took by the operation: " + ((Date.now() - date) / 1000) + " secs")

                                                    botManager.updateConsole(botManager.config["lastVersionReleasedIsBeta"] ? "\nFound " + i + " packets in this version (" + botManager.config["lastVersionAndroidBeta"] + ") !" : "\nFound " + i + " packets in this version (" + botManager.config["lastVersionAndroid"] + ") !")
                                                    botManager.updateConsole("Time took by the operation: " + ((Date.now() - date) / 1000) + " secs")

                                                });
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    });
                }
                download(url, botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta"] + ".yml" : botManager.config["lastVersionAndroid"] + ".yml", true, function foo(){}) //we don't need a callback but there must be one
            }
        }
    }
}

module.exports = Decompiler;