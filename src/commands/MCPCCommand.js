const Discord = require('discord.js');
var request = require('request');
require('./../BedrockUpdateBot.js');

class MCPCCommand {
    static getName() {
        return 'mcpc';
    }

    static getDescription() {
        return 'Query a MCPC server to get infos about him';
    }

    static getPermission() {
        return 'everyone';
    }

    static executeCommand(message) {
        let args = message.content.split(' ')
        var url = 'https://use.gameapis.net/mc/query/info/' + args[1]
        request(url, function (err, response, body) {
            if (err) {
                console.log(err);
                return message.channel.send("Errors");
            }
            if (body.length !== 0) {
                body = JSON.parse(body);

                if (body.status) {
                    const embed = new Discord.RichEmbed()
                        .setTitle(`Status of ${body.hostname}:${body.port}`)
                        .setColor('#0941a9')
                        .setAuthor(botManager.username, botManager.avatarURL)
                        .setFooter(`Status asked by ${message.author.username}`, message.author.avatarURL)
                        .addField('Players', body.players.online + '/' + body.players.max)
                        .addField('MOTD', body.motds.clean)
                        .addField('Ping', body.ping + " ms")
                        .setImage("https://use.gameapis.net/mc/query/banner/" + args[1] + "/night")
                    message.channel.send({ embed })
                } else {
                    message.channel.send('The server is not answering.')
                }
            } else {
                message.channel.send('The server is not answering.')
            }
        });
    }
}

module.exports = MCPCCommand;