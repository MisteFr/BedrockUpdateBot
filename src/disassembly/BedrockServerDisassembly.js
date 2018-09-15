require('./../BedrockUpdateBot.js');
const fs = require('fs');
const getUrls = require('get-urls');
const https = require('https');
const StreamZip = require('node-stream-zip');
const JsDiff = require('diff');
const github = require('octonode');


class BedrockServerDisassembly {

    static run(url) {
        fs.mkdirSync("MCPE/Release/" + botManager.config["lastVersionAndroid"] + "/BedrockServer")
        var file = fs.createWriteStream("MCPE/Release/" + botManager.config["lastVersionAndroid"] + "/BedrockServer/" + botManager.config["lastVersionAndroid"] + ".zip");
        var request = https.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                const zip = new StreamZip({
                    file: "MCPE/Release/" + botManager.config["lastVersionAndroid"] + "/BedrockServer/" + botManager.config["lastVersionAndroid"] + ".zip",
                    storeEntries: true
                });

                zip.on('ready', () => {
                    console.log('Entries read in the apk: ' + zip.entriesCount);
                    for (const entry of Object.values(zip.entries())) {
                        if (entry.name == "bedrock_server") {
                            zip.extract('bedrock_server', "MCPE/Release/" + botManager.config["lastVersionAndroid"] + "/BedrockServer/" + botManager.config["lastVersionAndroid"], err => {
                                zip.close();
                                const { exec } = require('child_process');
                                exec("readelf -Ws MCPE/Release/" + botManager.config["lastVersionAndroid"] + "/BedrockServer/" + botManager.config["lastVersionAndroid"], { maxBuffer: 2048 * 20000 }, (err, stdout, stderr) => {
                                    if (err) {
                                        console.log(err.message)
                                        return;
                                    }

                                    var infoText = "* [Symbols diff with " + botManager.config["lastVersionAndroid2"] + "](#symbols-diff)\n\n";

                                    var newSymbolArrayNameToAddress = [];
                                    var newSymbolList = (stdout.split("Ndx Name")[1]).split("\n");

                                    newSymbolList.forEach(function (element) {
                                        var subArray = botManager.cleanArray((element.split(" ")));
                                        if (subArray[7] !== undefined && subArray[1] !== undefined) {
                                            newSymbolArrayNameToAddress[subArray[7]] = subArray[1].toString();
                                        }
                                    })


                                    var oldSymbolArrayNameToAddress = [];
                                    var oldSymbolList = (botManager.config["BSsymbolsListRelease"].split("Ndx Name")[1]).split("\n");

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
                                            infoText = infoText + "There are some new symbols added in this version by comparaison to " + botManager.config["lastVersionAndroid2"] + ".";
                                            console.log('Found new symbols (Bedrock Server)!');
                                            console.log(Added)
                                            infoText = infoText + "\n" + "```";
                                            for (var key in Added) {
                                                var value = Added[key];
                                                infoText = infoText + "\n" + "    - " + key + " (Address: " + value + ")"
                                            }
                                            infoText = infoText + "\n" + "```";
                                        } else {
                                            infoText = infoText + "There are no symbols added in this version by comparaison to " + botManager.config["lastVersionAndroid2"] + ".";
                                        }

                                        infoText = infoText + "\n\n";

                                        if (someRemoved === true) {
                                            infoText = infoText + "There are some new symbols removed in this version by comparaison to " + botManager.config["lastVersionAndroid2"] + ".";
                                            console.log('Found removed symbols (Bedrock Server)!');
                                            console.log(Removed)
                                            infoText = infoText + "\n" + "```";
                                            for (var key in Removed) {
                                                var value = Removed[key];
                                                infoText = infoText + "\n" + "    - " + key + " (Address: " + value + ")"
                                            }
                                            infoText = infoText + "\n" + "```";
                                        } else {
                                            infoText = infoText + "There are no symbols removed in this version by comparaison to " + botManager.config["lastVersionAndroid2"] + ".";
                                        }
                                    } else {
                                        infoText = infoText + "There are no symbols added and removed in this version by comparaison to " + botManager.config["lastVersionAndroid2"] + ".";
                                    }

                                    console.log("Uplaoding symbol list (BedrockServer)")

                                    var githubClient = github.client(botManager.loginConfig['githubToken']);

                                    githubClient.repo('MisteFr/minecraft-bedrock-documentation').createContents("release/" + botManager.config["lastVersionAndroid"] + "/BedrockServer/" + botManager.config["lastVersionAndroid"] + "_symbols.md", "Adding symbols bump from " + botManager.config["lastVersionAndroid"] + " Bedrock Server.", stdout, (err, data) => {
                                        if (err) {
                                            botManager.updateConsole('\nError while trying to update the symbols dump of this version (' + botManager.config['lastVersionAndroid'] + ') (BedrockServer). Error message: ' + err.message);
                                            return console.error(err);
                                        }else{
                                            githubClient.repo('MisteFr/minecraft-bedrock-documentation').createContents("release/" + botManager.config["lastVersionAndroid"] + "/BedrockServer/" + botManager.config["lastVersionAndroid"] + "_info.md", "Adding symbols diffs from " + botManager.config["lastVersionAndroid"] + " Bedrock Server", infoText, (err, data) => {
                                                if (err) {
                                                    botManager.updateConsole('\nError while trying to update the version infos  of this version (' + botManager.config['lastVersionAndroid'] + ') (BedrockServer). Error message: ' + err.message);
                                                    return console.error("error" + err);
                                                }
                                                console.log(data.content.html_url);
                                                botManager.sendToChannels('pmmp', 'Uploaded the version infos of ' + botManager.config['lastVersionAndroid'] + ' (BedrockServer) here: ' + data.content.html_url)
                                                botManager.channelToDebugMcpe.send('Uploaded the version infos of ' + botManager.config['lastVersionAndroid'] + ' (BedrockServer) here: ' + data.content.html_url)
                                            });
                                        }
                                    });


                                    botManager.config["BSsymbolsListRelease"] = stdout;

                                    botManager.saveConfig()
                                })
                            })
                        }
                    }
                })
            })
        })
    }

}

module.exports = BedrockServerDisassembly;