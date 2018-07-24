const Discord = require('discord.js');
var request = require('request');
require('./../BedrockUpdateBot.js');

class MCPECommand {
    static getName() {
        return 'mcpe';
    }

    static getDescription() {
        return 'Query a MCPE server to get infos about him';
    }

    static getPermission() {
        return 'everyone';
    }

    static executeCommand(message) {
        let args = message.content.split(' ')
        var url = 'https://use.gameapis.net/mcpe/query/info/' + args[1]
        request(url, function (err, response, body) {
            if (err) {
                console.log(err);
                return message.channel.send("Error.");
            }
            body = JSON.parse(body);
            if (body.status) {
                const embed = new Discord.RichEmbed()
                    .setTitle(`Status of ${body.hostname}:${body.port}`)
                    .setColor('#0941a9')
                    .setAuthor(botManager.username, botManager.avatarURL)
                    .setFooter(`Status asked by ${message.author.username}`, message.author.avatarURL)
                    .addField('Players', body.players.online + '/' + body.players.max)
                    .addField('MOTD', body.motds.clean)
                    .addField('Version', "MCPE version " + body.version)
                message.channel.send({ embed })
            } else {
                message.channel.send('Server not answering')
            }
        });
    }
}

module.exports = MCPECommand;