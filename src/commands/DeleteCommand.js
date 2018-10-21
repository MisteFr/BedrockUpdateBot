require('./../BedrockUpdateBot.js');

class DeleteCommand {
    static getName() {
        return 'delete';
    }

    static getDescription() {
        return '';
    }

    static getPermission() {
        return 'miste';
    }

    static executeCommand(message) {
        botManager.Bot.channelsToSend.forEach((data, id) => {
            var guildId = id;
            for (var key in data) {
                var channelName = Object.keys(data[key])[0];
                for (var key2 in Object.values(data[key])) {
                    for (var key3 in Object.values(data[key])[key2]) {
                        var requiredType = Object.values(data[key])[key2][key3];
                        if (requiredType == "news" || requiredType == "debug") {
                            var channel = botManager.Bot.guilds.get(guildId).channels.find('name', channelName);
                            if (channel !== null && channel !== undefined) {
                                channel.fetchMessages({limit: 100}).then(messages => {
                                    let messagesArr = messages.array();
                                    let messageCount = messagesArr.length;
                                    let i2 = 0;
                                    for (let i = 0; i < messageCount; i++) {
                                        if (messagesArr[i].author.username == "BedrockUpdateBot") {
                                            if (i2 === 0) {
                                                messagesArr[i].delete();
                                                i2++
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            }
        });
        message.channel.send("Deleted all the latest posts !")
    }
}

module.exports = DeleteCommand;