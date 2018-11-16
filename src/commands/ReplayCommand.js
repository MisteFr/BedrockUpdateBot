require('./../BedrockUpdateBot.js');
const ytdl = require('ytdl-core');

class ReplayCommand {
    static getName() {
        return 'replay';
    }

    static getDescription() {
        return 'Replay the last song played';
    }

    static getPermission() {
        return 'everyone';
    }

    static executeCommand(message) {
        if (message.member.voiceChannel) {
            message.member.voiceChannel.join()
                .then(connection => {
                    botManager.voice_handler = connection.playStream(ytdl(botManager.array[0]));
                })
                .catch(console.log);
            message.channel.send("The last song has been restarted.");
        } else {
            message.reply("You aren't in a channel.");
        }
    }
}

module.exports = ReplayCommand;