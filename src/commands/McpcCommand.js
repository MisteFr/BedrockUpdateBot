const Discord = require('discord.js');
const util = require('minecraft-server-util');
require('../BedrockUpdateBot.js');

class LatestMcpeCommand {
    static getName() {
        return 'mcpc';
    }

    static getDescription() {
        return 'Ping a minecraft java server';
    }

    static getPermission() {
        return 'everyone';
    }

    static executeCommand(message) {
        let args = message.content.split(' ')
        if(!args[2]){
            message.channel.send('Please give a port to query (>mcpc <ip> <port>).')
            return
        }
        util.status(args[1], { port: parseInt(args[2]), enableSRV: true, timeout: 10000 })
        .then((response) => {
            const embed = new Discord.MessageEmbed()
                .setTitle(`Status of ${args[1]}:${response.port}`)
                .setColor('#0941a9')
                .setFooter(`Status asked by ${message.author.username}`, message.author.avatarURL)
                .addField('Players', response.onlinePlayers + '/' + response.maxPlayers)
                .addField('MOTD', response.description.descriptionText)
            message.channel.send({ embed })
        })
        .catch((error) => {
            message.channel.send('The server is not answering.')
            console.log(error)
            throw error
        });
    }
}

module.exports = LatestMcpeCommand;