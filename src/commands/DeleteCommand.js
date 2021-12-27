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
        botManager.Bot.guildsToSend.forEach((data, id) => {
            let guildId = id;
            for (let key in data) {
                let channelName = Object.keys(data[key])[0];
                for (let key2 in Object.values(data[key])) {
                    for (let key3 in Object.values(data[key])[key2]) {
                        let requiredType = Object.values(data[key])[key2][key3];
                        if (requiredType === "news" || requiredType === "debug") {
                            if (botManager.Bot.guilds.cache.get(guildId) !== undefined) {
                                let channel = botManager.Bot.guilds.cache.get(guildId).channels.cache.find(channel => channel.name === channelName);
                                if (channel !== null && channel !== undefined) {
                                    channel.messages.fetch({ limit: 100 }).then(messages => {
                                        let messagesArr = messages.array();
                                        let messageCount = messagesArr.length;
                                        let i2 = 0;
                                        for (let i = 0; i < messageCount; i++) {
                                            if (messagesArr[i].author.username === "BedrockUpdateBot") {
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
            }
        });
        message.channel.send("Deleted all the latest posts !")
    }
}

module.exports = DeleteCommand;