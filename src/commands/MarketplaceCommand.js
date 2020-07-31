const Discord = require('discord.js');

class MarketplaceCommand {
    static getName() {
        return 'marketplace';
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
                        var nameOfTheChannel = message.mentions.channels.first().name;
                        if (message.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
                            var channelFound = false;
                            if(botManager.loginConfig['channels'][message.guild.id]){
                                botManager.loginConfig['channels'][message.guild.id].forEach(function (element) {
                                    let key = Object.keys(element)[0];
                                    if (key === nameOfTheChannel) {
                                        channelFound = true;
                                        let val = Object.values(element);
                                        if(!val[0].includes("marketplace")){
                                            val[0].push("marketplace");

                                            botManager.loginConfig['channels'][message.guild.id][(botManager.loginConfig['channels'][message.guild.id].indexOf(element))][nameOfTheChannel] = val[0];
                                            botManager.saveConfig()

                                            message.reply("Correctly set up " + nameOfTheChannel + " to receive marketplace changes!")
                                        }else{
                                            message.reply("This channel is already set up to receive marketplace changes.")
                                        }
                                    }
                                })
                                if(!channelFound){
                                    let objectToSave = {[nameOfTheChannel]: ["marketplace"]}
                                    botManager.loginConfig['channels'][message.guild.id].push(objectToSave)
                                    botManager.saveConfig()

                                    message.reply("Correctly set up " + nameOfTheChannel + " to receive marketplace changes!")
                                }
                            }else{
                                message.reply("You need to set the minecraft news channel first.")
                            }
                        } else {
                            message.reply("Only the admins of this discord server can set the channel.")
                        }
                    }else{
                        message.reply("You need to # a channel (eg: >marketplace register #general).")
                    }
            break;
            case "unregister":
                    if (message.mentions.channels.size === 1) {
                        var nameOfTheChannel = message.mentions.channels.first().name;
                        if (message.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
                            if(botManager.loginConfig['channels'][message.guild.id]){
                                botManager.loginConfig['channels'][message.guild.id].forEach(function (element) {
                                    let key = Object.keys(element)[0];
                                    if (key === nameOfTheChannel) {
                                        channelFound = true;
                                        let val = Object.values(element);
                                        if(val[0].includes("marketplace")){
                                            if(val[0].length > 1){
                                                var index = val[0].indexOf("marketplace");
                                                if (index > -1) {
                                                    val[0].splice(index, 1);
                                                }
                                                

                                                botManager.loginConfig['channels'][message.guild.id][(botManager.loginConfig['channels'][message.guild.id].indexOf(element))][nameOfTheChannel] = val[0];
                                                botManager.saveConfig()
                                                
                                                message.reply("You won't receive marketplace changes in " + nameOfTheChannel + " anymore.")
                                            }else{
                                                botManager.loginConfig['channels'][message.guild.id].splice((botManager.loginConfig['channels'][message.guild.id].indexOf(element)), 1);
                                                botManager.saveConfig()

                                                message.reply("You won't receive marketplace changes in " + nameOfTheChannel + " anymore.")
                                            }
                                        }else{
                                            message.reply("This channel isn't set up to receive marketplace changes.")
                                        }
                                    }
                                })
                            }else{
                                message.reply("You didn't set any channels for the marketplace changes.")
                            }
                        } else {
                            message.reply("Only the admins of this discord server can unregister the channel.")
                        }
                    }else{
                        message.reply("You need to # a channel (eg: >marketplace unregister #general).")
                    }
            break;
            default:
                message.reply("You need to specify a parameter to this command (eg: >marketplace register/unregister #channel).")
        }
    }
}

module.exports = MarketplaceCommand;