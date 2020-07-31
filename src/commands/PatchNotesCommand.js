const Discord = require('discord.js');
require('./../BedrockUpdateBot.js');

class PatchNotesCommand {
    static getName() {
        return 'patchnotes';
    }

    static getDescription() {
        return 'Get patch notes from a version by version id (eg: 1.9.0.5)';
    }

    static getPermission() {
        return 'everyone';
    }

    static executeCommand(message) {
        if (botManager.isCheckingPatchNotes === false) {
            let args = message.content.split(' ')
            botManager.getPatchNotesFrom(args[1], false, function (response) {
                if (Array.isArray(response)) {
                    var embed = new Discord.RichEmbed()
                        .setTitle("Patch notes from: " + args[1])
                        .addField("Description", response[0])
                        .addField("Patch Notes", response[1])
                        .setColor('#0941a9')
                        .setURL(response[2])
                        .setAuthor("BedrockUpdateBot", botManager.avatarURL)

                    message.channel.send({ embed })
                } else {
                    message.channel.send("No patch notes found for this version.")
                }
            })
        } else {
            message.channel.send("Already getting some patch notes, please wait.")
        }
    }
}

module.exports = PatchNotesCommand;