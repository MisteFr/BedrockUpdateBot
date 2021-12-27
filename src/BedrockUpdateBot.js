const Discord = require('discord.js');
const Bot = new Discord.Client();

const BedrockUpdateBotManager = require('./manager/BedrockUpdateBotManager');

global.botManager = new BedrockUpdateBotManager()

process.on('unhandledRejection', err => {});

Bot.login(botManager.loginConfig["botToken"]);

Bot.on('ready', () => {
  botManager.init(Bot)
});

Bot.on('error', e => {
  console.log(e)
  botManager.sendToMiste("[ERROR] " + e.message)
});

Bot.on("guildCreate", guild => {
  if(botManager.loginConfig['channels'][guild.id] === undefined){
    Bot.user.setActivity("Mojang | >help | " + Bot.guilds.cache.size + " guilds", { type: ("WATCHING") });
    console.log(guild.name)
    const defaultChannel = botManager.getDefaultChannel(guild)
    defaultChannel.send("Hey <@" + guild.ownerID + "> !\nThanks for adding me on your server !\nCan you please tell me in what channel do you want me to send the latest news concerning Minecraft and Minecraft Bedrock Edition by answering to this message 'The channel I choose is <name>'\n\n**Please note that if I don't have the perms to post in this channel you won't see any news !**")
    botManager.loginConfig["waitingForFinalRegister"].push(guild.id)
    botManager.saveConfig()
    if(guild.owner === null){
      botManager.sendToMiste("Added on " + guild.name + ".")
    }else{
      guild.owner.user.send("Hey !\nThanks for adding me on your server !\nCan you please tell me in what channel do you want me to send the latest news concerning Minecraft and Minecraft Bedrock Edition by sending to one of the channel off your discord server 'The channel I choose is <name>'\n\n**Please note that if I don't have the perms to post in this channel you won't see any news !**");
      botManager.sendToMiste("Added on " + guild.name + " owned by " + guild.owner.user.username + ".")
    }
  }else{
    botManager.sendToMiste("Back from outage: " + guild.name + ".")
  }
})


Bot.on("guildDelete", guild => {
  if(guild.available){
    if (botManager.loginConfig['channels'][guild.id] !== null && botManager.loginConfig['channels'][guild.id] !== undefined) {
      delete botManager.loginConfig['channels'][guild.id]
      botManager.saveConfig()
      if (botManager.Bot.guildsToSend.has(guild.id)) {
        botManager.Bot.guildsToSend.delete(guild.id)
      }
    }
    if (botManager.loginConfig["waitingForFinalRegister"].includes(guild.id)) {
      botManager.loginConfig["waitingForFinalRegister"] = botManager.loginConfig["waitingForFinalRegister"].filter(item => item !== guild.id)
      botManager.saveConfig()
    }
    Bot.user.setActivity("Mojang | >help | " + Bot.guilds.cache.size + " guilds", { type: ("WATCHING") });
    if(guild.owner === null){
      botManager.sendToMiste("Removed from " + guild.name + ".")
    }else{
      botManager.sendToMiste("Removed from " + guild.name + " owned by " + guild.owner.user.username + ".")
    }
  }else{
    if (typeof guild.name !== 'undefined'){
      botManager.sendToMiste("Outage for " + guild.name + ".")
    }
  }
})

Bot.on("channelUpdate", (oldChannel, newChannel) => {
  let guildId = oldChannel.guild.id;
  if (botManager.Bot.guildsToSend.get(guildId) !== undefined) {
    if (oldChannel.name !== newChannel.name) {
      let newObject = [];

      botManager.loginConfig['channels'][guildId].forEach(function (element) {
        let key = Object.keys(element)[0];
        if (key === oldChannel.name) {
          key = newChannel.name;
        }
        let val = Object.values(element);
        let objectToSave = {}
        objectToSave[key] = val[0];
        newObject.push(objectToSave)
      })

      botManager.loginConfig['channels'][newChannel.guild.id] = newObject;
      botManager.Bot.guildsToSend.set(newChannel.guild.id, botManager.loginConfig["channels"][newChannel.guild.id]);
      botManager.saveConfig()
    }
  }
})

Bot.on("channelDelete", channel => {
  let guildId = channel.guild.id;
  if (botManager.Bot.guildsToSend.get(guildId) !== undefined) {
    if (botManager.loginConfig['channels'][channel.guild.id] !== null && botManager.loginConfig['channels'][channel.guild.id] !== undefined) {
      if (Object.keys(botManager.loginConfig['channels'][channel.guild.id]).length === 1) {
        if(botManager.loginConfig['channels'][channel.guild.id][0][channel.name]){
          delete botManager.loginConfig['channels'][channel.guild.id]
        if (botManager.Bot.guildsToSend.has(channel.guild.id)) {
          botManager.Bot.guildsToSend.delete(channel.guild.id)
        }
        botManager.loginConfig["waitingForFinalRegister"].push(channel.guild.id)
        botManager.saveConfig()
        if(channel.guild.owner){
          channel.guild.owner.user.send("Hey !\nYou just removed the channel where I was posting in the latest news :(\nCan you please tell me in what channel do you want me to send the latest news concerning Minecraft and Minecraft Bedrock Edition by sending to one of the channel off your discord server 'The channel I choose is <name>'\n\n**Please note that if I don't have the perms to post in this channel you won't see any news !**");
        }
        const defaultChannel = botManager.getDefaultChannel(channel.guild)
        defaultChannel.send("Hey <@" + defaultChannel.guild.ownerID + "> !\nYou just removed the channel I was posting in the latest news :(\nCan you please tell me in what channel do you want me to send the latest news concerning Minecraft and Minecraft Bedrock Edition by answering to this message 'The channel I choose is <name>'\n\n**Please note that if I don't have the perms to post in this channel you won't see any news !**")
        }
      } else {
        var newObject = [];
        botManager.loginConfig['channels'][guildId].forEach(function (element) {
          let key = Object.keys(element)[0];
          if (key !== channel.name) {
            let val = Object.values(element);
            let objectToSave = {}
            objectToSave[key] = val[0];
            newObject.push(objectToSave)
          }
          if (Object.keys(element)[0] === channel.name) {
            if ((Object.values(element)[0]).includes("news")) {
              botManager.loginConfig["waitingForFinalRegister"].push(channel.guild.id)
              botManager.saveConfig()
              if(channel.guild.owner){
                channel.guild.owner.user.send("Hey !\nYou just removed the channel where I was posting in the latest news :(\nCan you please tell me in what channel do you want me to send the latest news concerning Minecraft and Minecraft Bedrock Edition by sending to one of the channel off your discord server 'The channel I choose is <name>'\n\n**Please note that if I don't have the perms to post in this channel you won't see any news !**"); 
              }
              const defaultChannel = botManager.getDefaultChannel(channel.guild)
              defaultChannel.send("Hey <@" + defaultChannel.guild.ownerID + "> !\nYou just removed the channel I was posting in the latest news :(\nCan you please tell me in what channel do you want me to send the latest news concerning Minecraft and Minecraft Bedrock Edition by answering to this message 'The channel I choose is <name>'\n\n**Please note that if I don't have the perms to post in this channel you won't see any news !**")
            }
          }
        })
        botManager.loginConfig['channels'][guildId] = newObject;
        botManager.saveConfig()
      }
    }
  }
})


Bot.on('message', message => {
  let objectToSave;
  let nameOfTheChannel;
  if (message.guild) {
    if (message.guild.id === "427140849546035201" && message.author.id === "427139134721622026" && message.channel.name === "json-notifications") {
      botManager.checkVersionAndDownload(message);
    }
  }
  if (message.guild !== null && message.author.username !== "BedrockUpdateBot") {
    if (botManager.loginConfig["waitingForFinalRegister"].includes(message.guild.id) && message.content.includes('The channel I choose is') && !message.content.includes('Thanks for')) {
      if (message.mentions.channels.size === 1) {
        let nameOfTheChannel = message.mentions.channels.first().name;
        let objectToSave = {};
        if (message.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
          objectToSave[nameOfTheChannel] = ["news"];
          botManager.loginConfig['channels'][message.guild.id] = [objectToSave];
          botManager.Bot.guildsToSend.set(message.guild.id, botManager.loginConfig["channels"][message.guild.id]);
          message.reply("Correctly setted up the bot for this discord server !\nYou will now receive all the Minecraft & Minecraft Bedrock latest news on the channel " + nameOfTheChannel + ".")
          botManager.loginConfig["waitingForFinalRegister"] = botManager.loginConfig["waitingForFinalRegister"].filter(item => item !== message.guild.id)
          botManager.saveConfig()
          return true;
        } else {
          message.reply("Only the admins of this discord server can set the channel.")
        }
      }

      nameOfTheChannel = (message.content.replace("The channel I choose is", "")).replace(/\s/g, '');
      let channelChose = Bot.guilds.cache.get(message.guild.id).channels.cache.find('name', nameOfTheChannel);
      if (channelChose !== null && channelChose !== undefined) {
        if (message.author.id === message.guild.ownerID) {
          objectToSave = {}
          objectToSave[nameOfTheChannel] = ["news"];
          botManager.loginConfig['channels'][message.guild.id] = [objectToSave];
          botManager.Bot.guildsToSend.set(message.guild.id, botManager.loginConfig["channels"][message.guild.id]);
          message.reply("Correctly setted up the bot for this discord server !\nYou will now receive all the Minecraft & Minecraft Bedrock latest news on the channel " + nameOfTheChannel + ".")
          botManager.loginConfig["waitingForFinalRegister"] = botManager.loginConfig["waitingForFinalRegister"].filter(item => item !== message.guild.id)
          botManager.saveConfig()
        } else {
          message.reply("Only the owner of the discord server can set the channel.")
        }
      } else {
        message.reply("Can't find the channel (" + nameOfTheChannel + ") on this discord server. Please retry: The channel I choose is <name>")
      }
    }
  }

  if (botManager.needConfirmation === true && message.author.username === botManager.needConfirmationAuthor) {
    if (message.content === (botManager.needConfirmationAuthor + " confirms that he wants to stop this bot")) {
      message.channel.send(message.author.username + " is stopping the bot !")
      message.channel.send("Shutting down ...")
      botManager.sendToMiste(message.author.username + " is stopping the bot !")

      Bot.destroy();
    }
  }

  if (message.content.includes("respect") || message.content.includes("Respect")) {
    if (message.content.includes("F") || message.content.includes("f")) {
      if (message.content.includes("press") || message.content.includes("Press")) {
        message.react("🇫")
      }
    }
  }

  if (message.content.includes("doubt") && message.content.length < 7) {
    message.react("🇽")
  }

  if (!message.content.startsWith('>') || message.author.bot) return;
  let realargs = message.content.slice('>'.length).split(/ +/);
  let commandName = realargs.shift();
  let command = Bot.commands.get(commandName);

  if (command === undefined) {
    return;
  }

  if (command.getPermission() === "miste" && message.author.id != botManager.config['ownerId']) {
    return message.reply("You don't have the permission to use this command.");
  }

  try {
    command.executeCommand(message);
  } catch (error) {
    message.reply('There was an error executing this command.');
    console.log(error);
  }
});