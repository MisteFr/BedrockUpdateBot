const Discord = require('discord.js');
var request = require('request');
var mcpeping = require('mcpe-ping');
require('./../BedrockUpdateBot.js');

class LatestMcpeCommand {
    static getName() {
        return 'mcpe';
    }

    static getDescription() {
        return 'Ping a server';
    }

    static getPermission() {
        return 'everyone';
    }

    static executeCommand(message) {
        let args = message.content.split(' ')
        mcpeping(args[1], args[2], function(err, res) {
            if (err) {
                message.channel.send('The server is not answering.')
            } else {
                const embed = new Discord.RichEmbed()
                .setTitle(`Status of ${args[1]}:${res.rinfo.port}`)
                .setColor('#0941a9')
                .setFooter(`Status asked by ${message.author.username}`, message.author.avatarURL)
                .addField('Players', res.currentPlayers + '/' + res.maxPlayers)
                .addField('MOTD', res.cleanName)
            message.channel.send({ embed })
            }
        }, 3000);
    }
}

module.exports = LatestMcpeCommand;