require('./../BedrockUpdateBot.js');
const fs = require('fs');
const https = require('https');
const StreamZip = require('node-stream-zip');
const github = require('octonode');


class BedrockServerDisassembly {
    static run(url, version) {
        botManager.isDoingDisassembly = true;
        if (!fs.existsSync("MCPE/Release/" + version + "/")) {
            fs.mkdirSync("MCPE/Release/" + version + "/")
        }
        fs.mkdirSync("MCPE/Release/" + version + "/BedrockServer")

        var yaml_config = require('node-yaml');
        var config = yaml_config.readSync("./../../dissasembly.yml");

        var file = fs.createWriteStream("MCPE/Release/" + version + "/BedrockServer/" + version + ".zip");
        var request = https.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                const zip = new StreamZip({
                    file: "MCPE/Release/" + version + "/BedrockServer/" + version + ".zip",
                    storeEntries: true
                });

                zip.on('ready', () => {
                    console.log('Entries read in the zip file: ' + zip.entriesCount);
                    for (const entry of Object.values(zip.entries())) {
                        if (entry.name == "bedrock_server") {
                            zip.extract('bedrock_server', "MCPE/Release/" + version + "/BedrockServer/" + version, err => {
                                zip.close();
                                const { exec } = require('child_process');
                                exec("readelf -Ws MCPE/Release/" + version + "/BedrockServer/" + version, { maxBuffer: 5048 * 100000 }, (err, stdout, stderr) => {
                                    if (err) {
                                        console.log(err.message)
                                        return;
                                    }

                                    if (botManager.config["lastVersionAndroid"] === version) {
                                        var comparedVersion = botManager.config["lastVersionAndroid2"];
                                    } else {
                                        var comparedVersion = botManager.config["lastVersionAndroid"];
                                    }

                                    var infoText = "* [Symbols diff with " + comparedVersion + "](#symbols-diff)\n\n";


                                    var newSymbolArrayNameToAddress = [];
                                    var newSymbolList = (stdout.split("Ndx Name")[1]).split("\n");

                                    newSymbolList.forEach(function (element) {
                                        var subArray = botManager.cleanArray((element.split(" ")));
                                        if (subArray[7] !== undefined && subArray[1] !== undefined) {
                                            newSymbolArrayNameToAddress[subArray[7]] = subArray[1].toString();
                                        }
                                    })


                                    var oldSymbolArrayNameToAddress = [];
                                    var oldSymbolList = (config["BSsymbolsListRelease"].split("Ndx Name")[1]).split("\n");

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
                                            infoText = infoText + "There are some new symbols added in this version by comparaison to " + comparedVersion + ".";
                                            console.log('Found new symbols (Bedrock Server)!');
                                            infoText = infoText + "\n" + "```";
                                            for (var key in Added) {
                                                var value = Added[key];
                                                infoText = infoText + "\n" + "    - " + key + " (Address: " + value + ")"
                                            }
                                            infoText = infoText + "\n" + "```";
                                        } else {
                                            infoText = infoText + "There are no symbols added in this version by comparaison to " + comparedVersion + ".";
                                        }

                                        infoText = infoText + "\n\n";

                                        if (someRemoved === true) {
                                            infoText = infoText + "There are some new symbols removed in this version by comparaison to " + comparedVersion + ".";
                                            console.log('Found removed symbols (Bedrock Server)!');
                                            infoText = infoText + "\n" + "```";
                                            for (var key in Removed) {
                                                var value = Removed[key];
                                                infoText = infoText + "\n" + "    - " + key + " (Address: " + value + ")"
                                            }
                                            infoText = infoText + "\n" + "```";
                                        } else {
                                            infoText = infoText + "There are no symbols removed in this version by comparaison to " + comparedVersion + ".";
                                        }
                                    } else {
                                        infoText = infoText + "There are no symbols added and removed in this version by comparaison to " + comparedVersion + ".";
                                    }

                                    console.log("Uploading symbol list (BedrockServer)")
                                    
                                    var githubClient = github.client(botManager.config['githubToken']);
                                        
                                      
                                    githubClient.repo('MisteFr/minecraft-bedrock-documentation').createContents("release/" + version + "/BedrockServer/" + version + "_info.md", "Adding symbols diffs from " + version + " Bedrock Server", infoText, (err, data) => {
                                        if (err) {
                                            botManager.sendToMiste('\nError while trying to update the version infos of this version (' + version + ') (BedrockServer). Error message: ' + err.message);
                                            return console.error("error: " + err);
                                        } else {
                                            /*
                                            Not really useful
                                            githubClient.repo('MisteFr/minecraft-bedrock-documentation').createContents("release/" + version + "/BedrockServer/" + version + "_symbols.md", "Adding symbols bump from " + version + " Bedrock Server.", stdout, (err, data) => {
                                                if (err) {
                                                    botManager.sendToMiste('\nError while trying to update the symbols dump of this version (' + version + ') (BedrockServer). Error message: ' + err.message);
                                                    return console.error(err);
                                                }
                                            });
                                            */
                                        }
                                        console.log(data.content.html_url);
                                        botManager.sendToChannels('pmmp', 'Uploaded the version infos of ' + version + ' (BedrockServer) here: ' + data.content.html_url)
                                        botManager.sendToMiste('Uploaded the version infos of ' + version + ' (BedrockServer) here: ' + data.content.html_url)
                                    });
                                    

                                    config["BSsymbolsListRelease"] = stdout;
                                    botManager.config["lastVersionAndroid"] = version
                                    botManager.saveConfig()
                                    yaml_config.writeSync("./../../dissasembly.yml", config)
                                    botManager.isDoingDisassembly = false;
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