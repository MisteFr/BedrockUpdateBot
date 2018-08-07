require('./../BedrockUpdateBot.js');
const fs = require('fs');
const getUrls = require('get-urls');
const https = require('https');
const StreamZip = require('node-stream-zip');
const JsDiff = require('diff');
const github = require('octonode');


class Deassembly {

    static run(version) {
        if (fs.existsSync(botManager.config["lastVersionReleasedIsBeta"] ? "MCPE/Beta/" + version + "_beta" : "MCPE/Release/" + version)) {
            if (fs.existsSync(botManager.config["lastVersionReleasedIsBeta"] ? "MCPE/Beta/" + version + "_beta" + "/" + version + "_beta.apk" : "MCPE/Release/" + version + "/" + version + ".apk")) {
                botManager.createNewConsoleMessage();
                var date = Date.now();
                botManager.updateConsole('Starting...');
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
                                    var infoText = "* [Protocol diff with " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] : botManager.config["lastVersionAndroid2"]) + "](#protocol-diff)\n\n";
                                    infoText = infoText + "* [Symbols diff with " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] : botManager.config["lastVersionAndroid2"]) + "](#symbols-diff)\n\n";
                                    infoText = infoText + "* [Entity Ids List diff with " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] : botManager.config["lastVersionAndroid2"]) + "](#entity-ids-list-diff)\n\n\n";
                                    infoText = infoText + "### Protocol diff\n";

                                    if (someAdded == true) {
                                        infoText = infoText + "There are some packets added in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                        console.log('Found new packet(s) !');
                                        console.log(Added)
                                        botManager.updateConsole('\nFound new packet(s) !');
                                        for (var key in Added) {
                                            var value = Added[key];
                                            botManager.updateConsole('   - ' + key + ' (' + value + ')');
                                            infoText = infoText + "\n" + "    - " + key + " (" + value + ")"
                                        }
                                    } else {
                                        console.log('There is no packets added');
                                        botManager.updateConsole('\nThere are no packets added');
                                        infoText = infoText + "There are no packets added in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                    }

                                    infoText = infoText + "\n\n";

                                    if (someRemoved == true) {
                                        infoText = infoText + "There are some packets removed in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                        console.log('There is some removed packet(s) !');
                                        console.log(Removed)
                                        botManager.updateConsole('\nThere are some removed packet(s) !');
                                        for (var key in Removed) {
                                            var value = Removed[key];
                                            botManager.updateConsole('   - ' + key + ' (' + value + ')');
                                            infoText = infoText + "\n" + "    - " + key + " (" + value + ")"
                                        }
                                    } else {
                                        console.log('There are no packets removed');
                                        botManager.updateConsole('\nThere are no packets removed');
                                        infoText = infoText + "There are no packets removed in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
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
                                                                    infoText = infoText + "\n" + "Detected something added in " + botManager.titleCase((packetName.replace(/_/g, " "))) + " (" + newId + ")\n\n```\n" + part.value + "\n```";
                                                                }
                                                            } else if (part.removed !== undefined && part.value !== undefined) {
                                                                if (part.value.includes("BinaryStream") && (part.value.includes("getB") || part.value.includes("writeB") || part.value.includes("writeF") || part.value.includes("writeN") || part.value.includes("writeS") || part.value.includes("writeU") || part.value.includes("writeV") || part.value.includes("getD") || part.value.includes("getF") || part.value.includes("getI") || part.value.includes("getS") || part.value.includes("getT") || part.value.includes("getV") || part.value.includes('getU'))) {
                                                                    for (var i in oldPacketsNameToId) {
                                                                        if (oldPacketsNameToId[i] == oldId) {
                                                                            var packetName = i;
                                                                        }
                                                                    }
                                                                    infoText = infoText + "\n" + "Detected something removed in " + botManager.titleCase((packetName.replace(/_/g, " "))) + " (" + newId + ")\n\n```\n" + part.value + "\n```";
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

                                    console.log('Authentificating to github');

                                    var githubClient = github.client(botManager.loginConfig['githubToken']);

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

                                    githubClient.repo('MisteFr/minecraft-bedrock-documentation').createContents((botManager.config["lastVersionReleasedIsBeta"] ? "beta/" + botManager.config["lastVersionAndroidBeta"] + "/" + botManager.config["lastVersionAndroidBeta"] + "_protocol.md" : "release/" + botManager.config["lastVersionAndroid"] + "/" + botManager.config["lastVersionAndroid"] + "_protocol.md"), (botManager.config["lastVersionReleasedIsBeta"] ? "Adding protocol bump from " + botManager.config["lastVersionAndroidBeta"] + "." : "Adding protocol documentation from " + botManager.config["lastVersionAndroid"] + "."), fixedText, (err, data) => {
                                        if (err) {
                                            botManager.updateConsole('\nError while trying to update the protocol documentation of this version (' + botManager.config['lastVersionReleased'] + '). Error message: ' + err.message);
                                            return console.error(err);
                                        }
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

                                        infoText = infoText + "\n\n\n\n### Symbols diff\n\n";

                                        var textToPublish = "";

                                        if (someRemoved !== false || someAdded !== false) {
                                            if (someAdded === true) {
                                                infoText = infoText + "There are some new symbols added in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                                console.log('Found new symbols !');
                                                console.log(Added)
                                                infoText = infoText + "\n" + "```";
                                                for (var key in Added) {
                                                    var value = Added[key];
                                                    infoText = infoText + "\n" + "    - " + key + " (Address: " + value + ")"
                                                }
                                                infoText = infoText + "\n" + "```";
                                            } else {
                                                infoText = infoText + "There are no symbols added in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                            }

                                            infoText = infoText + "\n\n";

                                            if (someRemoved === true) {
                                                infoText = infoText + "There are some new symbols removed in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                                console.log('Found removed symbols !');
                                                console.log(Removed)
                                                infoText = infoText + "\n" + "```";
                                                for (var key in Removed) {
                                                    var value = Removed[key];
                                                    infoText = infoText + "\n" + "    - " + key + " (Address: " + value + ")"
                                                }
                                                infoText = infoText + "\n" + "```";
                                            } else {
                                                infoText = infoText + "There are no symbols removed in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                            }
                                        } else {
                                            infoText = infoText + "There are no symbols added and removed in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                        }

                                        console.log("Uplaoding symbol list")

                                        githubClient.repo('MisteFr/minecraft-bedrock-documentation').createContents((botManager.config["lastVersionReleasedIsBeta"] ? "beta/" + botManager.config["lastVersionAndroidBeta"] + "/" + botManager.config["lastVersionAndroidBeta"] + "_symbols.md" : "release/" + botManager.config["lastVersionAndroid"] + "/" + botManager.config["lastVersionAndroid"] + "_symbols.md"), (botManager.config["lastVersionReleasedIsBeta"] ? "Adding symbols list from " + botManager.config["lastVersionAndroidBeta"] + "." : "Adding symbols bump from " + botManager.config["lastVersionAndroid"] + "."), stdout, (err, data) => {
                                            if (err) {
                                                botManager.updateConsole('\nError while trying to update the symbols dump of this version (' + botManager.config['lastVersionReleased'] + '). Error message: ' + err.message);
                                                return console.error(err);
                                            }
                                        });

                                        if (botManager.config["lastVersionReleasedIsBeta"] === true) {
                                            botManager.config["symbolsListBeta"] = stdout;
                                        } else {
                                            botManager.config["symbolsListRelease"] = stdout;
                                        }

                                        botManager.saveConfig()

                                        console.log("Extracting entity ids list")

                                        exec(botManager.config["lastVersionReleasedIsBeta"] ? "python entityIds.py MCPE/Beta/" + botManager.config["lastVersionAndroidBeta"] + "/" + botManager.config["lastVersionAndroidBeta"] + ".so" : "python entityIds.py MCPE/Release/" + botManager.config["lastVersionAndroid"] + "/" + botManager.config["lastVersionAndroid"] + ".so", { maxBuffer: 1024 * 500 }, (err, stdout, stderr) => {
                                            if (err) {
                                                console.log(err.message)
                                                return;
                                            }

                                            if (botManager.config["lastVersionReleasedIsBeta"] === true) {
                                                var oldStdout = botManager.config["entityIdListBeta"];
                                            } else {
                                                var oldStdout = botManager.config["entityIdListRelease"];
                                            }

                                            var smthAdded = false;
                                            var smthRemoved = false;

                                            var Added = [];
                                            var Removed = [];

                                            var diff = JsDiff.diffLines(oldStdout, stdout);
                                            diff.forEach(function (part) {
                                                if (part.added !== undefined || part.removed !== undefined) {
                                                    if (part.added !== undefined && part.value !== undefined) {
                                                        smthAdded = true;
                                                        Added[(part.value.split("=")[0])] = ((part.value.split("=")[1]).replace(";", "")).replace("\n", "");
                                                    } else if (part.removed !== undefined && part.value !== undefined) {
                                                        smthRemoved = true;
                                                        Removed[(part.value.split("=")[0])] = ((part.value.split("=")[1]).replace(";", "")).replace("\n", "");
                                                    }
                                                }
                                            });

                                            var textToPublish = "";

                                            infoText = infoText + "\n\n\n\n### Entity Ids List diff\n\n";

                                            if (smthAdded === true) {
                                                infoText = infoText + "There is/are some new entity/entities added in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                                console.log('Found new entities !');
                                                console.log(Added)
                                                infoText = infoText + "\n" + "```";
                                                for (var key in Added) {
                                                    var value = Added[key];
                                                    infoText = infoText + "\n" + "    - " + key + " (entityId: " + value + ")"
                                                }
                                                infoText = infoText + "\n" + "```";
                                            } else {
                                                infoText = infoText + "There are no entities added in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                            }

                                            infoText = infoText + "\n\n";

                                            if (smthRemoved === true) {
                                                infoText = infoText + "There is/are some new entity/entities removed in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                                console.log('Found removed entities !');
                                                console.log(Removed)
                                                infoText = infoText + "\n" + "```";
                                                for (var key in Removed) {
                                                    var value = Removed[key];
                                                    infoText = infoText + "\n" + "    - " + key + " (entityId: " + value + ")"
                                                }
                                                infoText = infoText + "\n" + "```";
                                            } else {
                                                infoText = infoText + "There are no entities removed in this version by comparaison to " + (botManager.config["lastVersionReleasedIsBeta"] ? botManager.config["lastVersionAndroidBeta2"] + "." : botManager.config["lastVersionAndroid2"] + ".");
                                            }

                                            textToPublish = textToPublish + "\n" + "```" + "\n" + stdout + "```";
                                            textToPublish = (textToPublish.replace(/\=/g, ": ")).replace(/\;/g, "");

                                            console.log("Uploading entity ids list")

                                            githubClient.repo('MisteFr/minecraft-bedrock-documentation').createContents((botManager.config["lastVersionReleasedIsBeta"] ? "beta/" + botManager.config["lastVersionAndroidBeta"] + "/" + botManager.config["lastVersionAndroidBeta"] + "_entityIdsList.md" : "release/" + botManager.config["lastVersionAndroid"] + "/" + botManager.config["lastVersionAndroid"] + "_entityIdsList.md"), (botManager.config["lastVersionReleasedIsBeta"] ? "Adding entity ids list from " + botManager.config["lastVersionAndroidBeta"] + "." : "Adding entity ids list from " + botManager.config["lastVersionAndroid"] + "."), textToPublish, (err, data) => {
                                                if (err) {
                                                    botManager.updateConsole('\nError while trying to update the entity ids list of this version (' + botManager.config['lastVersionReleased'] + '). Error message: ' + err.message);
                                                    return console.error(err);
                                                } else {
                                                    console.log("Uploading version infos")
                                                    githubClient.repo('MisteFr/minecraft-bedrock-documentation').createContents((botManager.config["lastVersionReleasedIsBeta"] ? "beta/" + botManager.config["lastVersionAndroidBeta"] + "/" + botManager.config["lastVersionAndroidBeta"] + "_info.md" : "release/" + botManager.config["lastVersionAndroid"] + "/" + botManager.config["lastVersionAndroid"] + "_info.md"), (botManager.config["lastVersionReleasedIsBeta"] ? "Adding protocol, symbols and entity ids list diffs infos from " + botManager.config["lastVersionAndroidBeta"] + "." : "Adding protocol, symbols and entity ids list diffs from " + botManager.config["lastVersionAndroid"] + "."), infoText, (err, data) => {
                                                        if (err) {
                                                            botManager.updateConsole('\nError while trying to update the entity ids list of this version (' + botManager.config['lastVersionReleased'] + '). Error message: ' + err.message);
                                                            return console.error("error" + err);
                                                        }
                                                        console.log(data.content.html_url);
                                                        botManager.sendToChannels('pmmp', 'Uploaded the version infos of ' + botManager.config['lastVersionReleased'] + ' here: ' + data.content.html_url)
                                                        botManager.channelToDebugMcpe.send('Uploaded the version infos of ' + botManager.config['lastVersionReleased'] + ' here: ' + data.content.html_url)
                                                    });
                                                }
                                            });


                                            if (botManager.config["lastVersionReleasedIsBeta"] === true) {
                                                botManager.config["entityIdListBeta"] = stdout;
                                            } else {
                                                botManager.config["entityIdListRelease"] = stdout;
                                            }

                                            botManager.saveConfig()

                                            console.log(botManager.config["lastVersionReleasedIsBeta"] ? "Found " + packetCount + " packets in this version (" + botManager.config["lastVersionAndroidBeta"] + ") !" : "Found " + i + " packets in this version (" + botManager.config["lastVersionAndroid"] + ") !")
                                            console.log("Time took by the operation: " + ((Date.now() - date) / 1000) + " secs")

                                            botManager.updateConsole(botManager.config["lastVersionReleasedIsBeta"] ? "\nFound " + packetCount + " packets in this version (" + botManager.config["lastVersionAndroidBeta"] + ") !" : "\nFound " + i + " packets in this version (" + botManager.config["lastVersionAndroid"] + ") !")
                                            botManager.updateConsole("Time took by the operation: " + ((Date.now() - date) / 1000) + " secs" + ".")
                                        })
                                    })
                                });
                            });
                        }

                    }
                });
            } else {
                console.log("I found the folder but no the file.")
                botManager.Bot.users.forEach(function (element) {
                    if (element.id == botManager.config['ownerId']) {
                        element.send("I found the folder but no the file.");
                    }
                });
            }
        } else {
            console.log("I didnt find the folder.")
            botManager.Bot.users.forEach(function (element) {
                if (element.id == botManager.config['ownerId']) {
                    element.send("I didnt find the folder.");
                }
            });
        }
    }
}

module.exports = Deassembly;