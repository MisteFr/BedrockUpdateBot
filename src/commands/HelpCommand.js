const Discord = require('discord.js');
require('./../BedrockUpdateBot.js');

class HelpCommand {
    static getName() {
        return 'help';
    }

    static getDescription() {
        return 'Get all the commands available';
    }

    static getPermission() {
        return 'everyone';
    }

    static executeCommand(message) {
        message.channel.send({
                embed: {
                    color: 627193,
                    author: {
                        name: botManager.username,
                        icon_url: botManager.avatarURL
                    },
                    title: "Commands",
                    description: "Here are the commands available",
                    fields: [{
                        name: ">invite",
                        value: "Get the invite link of the bot"
                    },
                    {
                        name: ">mcpe <ip:port",
                        value: "Query a MCPE server to get infos about it"
                    },
                    {
                        name: ">latestMc",
                        value: "Get the latest MC informations"
                    },
                    {
                        name: ">latestMcpe",
                        value: "Get the latest MCPE informations"
                    },
                    {
                        name: ">listemojis",
                        value: "Get all the emojis of the server you are in"
                    },
                    {
                        name: ">play <youtube link>",
                        value: "Play a youtube link"
                    },
                    {
                        name: ">pause",
                        value: "Pause the actual song"
                    },
                    {
                        name: ">resume",
                        value: "Resume the song paused"
                    },
                    {
                        name: ">replay",
                        value: "Replay the last song played"
                    },
                    {
                        name: ">stop",
                        value: "Stop the song beeing played"
                    }
                    ],
                    timestamp: new Date(),
                    footer: {
                        icon_url: botManager.avatarURL,
                        text: "©MisteBot"
                    }
                }
            });
    }
}

module.exports = HelpCommand;