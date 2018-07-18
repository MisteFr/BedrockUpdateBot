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
        botManager.channelToSend3.fetchMessages({ limit: 100 }).then(messages => {
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

        botManager.channelToSend2.fetchMessages({ limit: 100 }).then(messages => {
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

        botManager.channelToSend.fetchMessages({ limit: 100 }).then(messages => {
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

        botManager.channelToTest.fetchMessages({ limit: 100 }).then(messages => {
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
        /*
        botManager.channelToSend4.fetchMessages({ limit: 100 }).then(messages => {
          let messagesArr = messages.array();
          let messageCount = messagesArr.length;
          let i2 = 0;
          for (let i = 0; i < messageCount; i++) {
            if (messagesArr[i].author.username == "BedrockUpdateBot") {
              if (i2 !== 0) {
                messagesArr[i].delete();
                i2++
              }
            }
          }
        });
        */
        message.channel.send("Deleted all the latest posts !")
    }
}

module.exports = DeleteCommand;