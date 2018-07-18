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
        //todo
        message.author.createDM().then(channel => {
            return channel.send({
                embed: {
                    color: 627193,
                    author: {
                        name: botManager.username,
                        icon_url: botManager.avatarURL
                    },
                    title: "Commands",
                    description: "Here are the commands available",
                    fields: [{
                        name: ">kill",
                        value: "Kill the bot (emergency command)"
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
                        name: ">mcpc <ip:port>",
                        value: "Query a MCPC server to get infos about him"
                    },
                    {
                        name: ">mcpe <ip:port>",
                        value: "Query a MCPE server to get infos about him"
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
        }).catch(console.error)

        message.reply("I sent you a dm with all the commands !")
    }
}

module.exports = HelpCommand;