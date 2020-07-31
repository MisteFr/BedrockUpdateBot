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
                    fields: [{
                        name: ">invite",
                        value: "Get the invite link of the bot"
                    },
                    {
                        name: ">marketplace register|unregister #channel",
                        value: "Set up a channel to receive marketplace changes."
                    },
                    {
                        name: ">documentation register|unregister #channel",
                        value: "Set up a channel to receive documentation updates."
                    },
                    {
                        name: ">mcpe <ip:port>",
                        value: "Query a MCPE server to get information regarding player count, etc."
                    },
                    {
                        name: ">latestMc",
                        value: "Get the latest Minecraft Java release and snapshot published"
                    },
                    {
                        name: ">latestMcpe",
                        value: "Get the latest Minecraft Bedrock release and snapshot published"
                    },
                    {
                        name: ">listemojis",
                        value: "Get all the emojis of the server you are in"
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