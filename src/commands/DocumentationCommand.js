const Discord = require('discord.js');

class DocumentationCommand {
    static getName() {
        return 'documentation';
    }

    static getDescription() {
        return '';
    }

    static getPermission() {
        return 'everyone';
    }

    static executeCommand(message) {
        let splittedMessage = message.content.split(" ");
        switch(splittedMessage[1]){
            case "register":
                    if (message.mentions.channels.size === 1) {
                        let nameOfTheChannel = message.mentions.channels.first().name;
                        if (message.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
                            let channelFound = false;
                            if(botManager.loginConfig['channels'][message.guild.id]){
                                botManager.loginConfig['channels'][message.guild.id].forEach(function (element) {
                                    let key = Object.keys(element)[0];
                                    if (key === nameOfTheChannel) {
                                        channelFound = true;
                                        let val = Object.values(element);
                                        if(!val[0].includes("documentation")){
                                            val[0].push("documentation");

                                            botManager.loginConfig['channels'][message.guild.id][(botManager.loginConfig['channels'][message.guild.id].indexOf(element))][nameOfTheChannel] = val[0];
                                            botManager.saveConfig()

                                            message.reply("Correctly set up " + nameOfTheChannel + " to receive documentation updates!")
                                        }else{
                                            message.reply("This channel is already set up to receive documentation updates.")
                                        }
                                    }
                                })
                                if(!channelFound){
                                    let objectToSave = {[nameOfTheChannel]: ["documentation"]}
                                    botManager.loginConfig['channels'][message.guild.id].push(objectToSave)
                                    botManager.saveConfig()

                                    message.reply("Correctly set up " + nameOfTheChannel + " to receive documentation updates!")
                                }
                            }else{
                                message.reply("You need to set the minecraft news channel first.")
                            }
                        } else {
                            message.reply("Only the admins of this discord server can set the channel.")
                        }
                    }else{
                        message.reply("You need to # a channel (eg: >documentation register #general).")
                    }
            break;
            case "unregister":
                    if (message.mentions.channels.size === 1) {
                        let nameOfTheChannel = message.mentions.channels.first().name;
                        if (message.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
                            if(botManager.loginConfig['channels'][message.guild.id]){
                                let channelFound = false;
                                botManager.loginConfig['channels'][message.guild.id].forEach(function (element) {
                                    let key = Object.keys(element)[0];
                                    if (key === nameOfTheChannel) {
                                        channelFound = true;
                                        let val = Object.values(element);
                                        if(val[0].includes("documentation")){
                                            if(val[0].length > 1){
                                                let index = val[0].indexOf("documentation");
                                                if (index > -1) {
                                                    val[0].splice(index, 1);
                                                }
                                                

                                                botManager.loginConfig['channels'][message.guild.id][(botManager.loginConfig['channels'][message.guild.id].indexOf(element))][nameOfTheChannel] = val[0];
                                                botManager.saveConfig()
                                                
                                                message.reply("You won't receive documentation updates in " + nameOfTheChannel + " anymore.")
                                            }else{
                                                botManager.loginConfig['channels'][message.guild.id].splice((botManager.loginConfig['channels'][message.guild.id].indexOf(element)), 1);
                                                botManager.saveConfig()

                                                message.reply("You won't receive documentation updates in " + nameOfTheChannel + " anymore.")
                                            }
                                        }else{
                                            message.reply("This channel isn't set up to receive documentation updates.")
                                        }
                                    }
                                })
                            }else{
                                message.reply("You didn't set any channels for the documentation updates.")
                            }
                        } else {
                            message.reply("Only the admins of this discord server can unregister the channel.")
                        }
                    }else{
                        message.reply("You need to # a channel (eg: >documentation unregister #general).")
                    }
            break;
            default:
                message.reply("You need to specify a parameter to this command (eg: >documentation register/unregister #channel).")
        }
    }
}

module.exports = DocumentationCommand;