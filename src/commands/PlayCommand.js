require('./../BedrockUpdateBot.js');
const ytdl = require('ytdl-core');

class PlayCommand {
    static getName() {
        return 'play';
    }

    static getDescription() {
        return 'Play a youtube link';
    }

    static getPermission() {
        return 'everyone';
    }

    static executeCommand(message) {
        let args = message.content.split(">play ");
        ytdl.getInfo(args[1], (error, info) => {
            if (error) {
                message.reply("You need to provide a valid link.");
                console.log(error);
            } else {
                if (message.member.voiceChannel) {
                    message.member.voiceChannel.join()
                        .then(connection => { // Connection is an instance of VoiceConnection
                            message.reply("I joined your channel and started to play " + args[1]);
                            botManager.array[0] = args[1];
                            botManager.voice_handler = connection.playStream(ytdl(args[1]));
                        })
                        .catch(console.log);
                } else {
                    message.reply("You aren't in a channel.");
                }
            }
        });
    }
}

module.exports = PlayCommand;