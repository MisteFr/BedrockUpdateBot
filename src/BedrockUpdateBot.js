const Discord = require('discord.js');
const Bot = new Discord.Client();

var BedrockUpdateBotManager = require('./manager/BedrockUpdateBotManager');

global.botManager = new BedrockUpdateBotManager()

Bot.login(botManager.config["botToken"]);

Bot.on('ready', () => {
  botManager.init(Bot)
});

Bot.on('error', e => {
  Bot.users.forEach(function (element) {
    if (element.id == botManager.config['ownerId']) {
      element.send("[ERROR] " + e.message);
    }
  });
});

Bot.on("guildCreate", guild => {
  guild.owner.user.send("Hey !\nThanks for adding me on your server !\nCan you please tell me in what channel do you want me to send the latest news concerning Minecraft and Minecraft Bedrock Edition by sending to one of the channel off your discord server 'The channel I chose is <name>'\n\n**Please note that if I don't have the perms to post in this channel you won't see any news !**");
  Bot.user.setActivity("Mojang | >help | " + Bot.guilds.size + " guilds", { type: ("WATCHING") });
  console.log(guild.name)
  botManager.getDefaultChannel(guild)
    .then(channel => channel.send("Hey <@" + guild.ownerID + "> !\nThanks for adding me on your server !\nCan you please tell me in what channel do you want me to send the latest news concerning Minecraft and Minecraft Bedrock Edition by answering to this message 'The channel I chose is <name>'\n\n**Please note that if I don't have the perms to post in this channel you won't see any news !**"))
  botManager.config["waitingForFinalRegister"].push(guild.id)
  botManager.saveConfig()
  Bot.users.forEach(function (element) {
    if (element.id == botManager.config['ownerId']) {
      element.send("Added on " + guild.name + " owned by " + guild.owner.user.username + ".");
    }
  });
})


Bot.on("guildDelete", guild => {
  if (botManager.config['channels'][guild.id] !== null && botManager.config['channels'][guild.id] !== undefined) {
    delete botManager.config['channels'][guild.id]
    botManager.saveConfig()
    if (botManager.Bot.channelsToSend.has(guild.id)) {
      botManager.Bot.channelsToSend.delete(guild.id)
    }
  }
  Bot.user.setActivity("Mojang | >help | " + Bot.guilds.size + " guilds", { type: ("WATCHING") });
  Bot.users.forEach(function (element) {
    if (element.id == botManager.config["ownerId"]) {
      element.send("Removed from " + guild.name + " owned by " + guild.owner.user.username + ".");
    }
  });
})

Bot.on("channelUpdate", (oldChannel, newChannel) => {
  var guildId = oldChannel.guild.id;
  if (botManager.Bot.channelsToSend.get(guildId) !== undefined) {
    if (botManager.Bot.channelsToSend.get(guildId)[0][oldChannel.name] !== undefined) {
      var objectToSave = {}
      objectToSave[newChannel.name] = ["news"];
      botManager.config['channels'][newChannel.guild.id] = [objectToSave];
      botManager.Bot.channelsToSend.set(newChannel.guild.id, botManager.config["channels"][newChannel.guild.id]);
      botManager.saveConfig()
    }
  }
})

Bot.on("channelDelete", channel => {
  var guildId = channel.guild.id;
  if (botManager.Bot.channelsToSend.get(guildId) !== undefined) {
    if (botManager.Bot.channelsToSend.get(guildId)[0][channel.name] !== undefined) {
      if (botManager.config['channels'][channel.guild.id] !== null && botManager.config['channels'][channel.guild.id] !== undefined) {
        delete botManager.config['channels'][channel.guild.id]
        if (botManager.Bot.channelsToSend.has(channel.guild.id)) {
          botManager.Bot.channelsToSend.delete(channel.guild.id)
        }
        botManager.config["waitingForFinalRegister"].push(channel.guild.id)
        botManager.saveConfig()
        channel.guild.owner.user.send("Hey !\nYou just removed the channel I was posting in the latest news :(\nCan you please tell me in what channel do you want me to send the latest news concerning Minecraft and Minecraft Bedrock Edition by sending to one of the channel off your discord server 'The channel I chose is <name>'\n\n**Please note that if I don't have the perms to post in this channel you won't see any news !**");
        botManager.getDefaultChannel(channel.guild)
          .then(defaultChannel => defaultChannel.send("Hey <@" + channel.guild.ownerID + "> !\nYou just removed the channel I was posting in the latest news :(\nCan you please tell me in what channel do you want me to send the latest news concerning Minecraft and Minecraft Bedrock Edition by answering to this message 'The channel I chose is <name>'\n\n**Please note that if I don't have the perms to post in this channel you won't see any news !**"))
      }
    }
  }
})


Bot.on('message', message => {
  if (message.guild !== null && message.author.username !== "BedrockUpdateBot") {
    if (botManager.config["waitingForFinalRegister"].includes(message.guild.id) && message.content.includes('The channel I chose is') && !message.content.includes('Thanks for')) {
      if (message.mentions.channels.size === 1) {
        var nameOfTheChannel = message.mentions.channels.first().name;
        if (message.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
          var objectToSave = {}
          objectToSave[nameOfTheChannel] = ["news"];
          botManager.config['channels'][message.guild.id] = [objectToSave];
          botManager.Bot.channelsToSend.set(message.guild.id, botManager.config["channels"][message.guild.id]);
          message.reply("Correctly setted up the bot for this discord server !\nYou will now receive all the Minecraft & Minecraft Bedrock latest news on the channel " + nameOfTheChannel + ".")
          botManager.config["waitingForFinalRegister"] = botManager.config["waitingForFinalRegister"].filter(item => item !== message.guild.id)
          botManager.saveConfig()
          return true;
        } else {
          message.reply("Only the admins of this discord server can set the channel.")
        }
      }

      var nameOfTheChannel = (message.content.replace("The channel I chose is", "")).replace(/\s/g, '');
      var channelChose = Bot.guilds.get(message.guild.id).channels.find('name', nameOfTheChannel);
      if (channelChose !== null && channelChose !== undefined) {
        if (message.author.id === message.guild.ownerID) {
          var objectToSave = {}
          objectToSave[nameOfTheChannel] = ["news"];
          botManager.config['channels'][message.guild.id] = [objectToSave];
          botManager.Bot.channelsToSend.set(message.guild.id, botManager.config["channels"][message.guild.id]);
          message.reply("Correctly setted up the bot for this discord server !\nYou will now receive all the Minecraft & Minecraft Bedrock latest news on the channel " + nameOfTheChannel + ".")
          botManager.config["waitingForFinalRegister"] = botManager.config["waitingForFinalRegister"].filter(item => item !== message.guild.id)
          botManager.saveConfig()
        } else {
          message.reply("Only the owner of the discord server can set the channel.")
        }
      } else {
        message.reply("Can't find the channel (" + nameOfTheChannel + ") on this discord server. Please retry: The channel I chose is <name>")
      }
    }
  }

  if (botManager.needConfirmation === true && message.author.username === botManager.needConfirmationAuthor) {
    if (message.content === (botManager.needConfirmationAuthor + " confirms that he wants to stop this bot")) {
      message.channel.send(message.author.username + " is stopping the bot !")
      message.channel.send("Shutting down ...")
      Bot.users.forEach(function (element) {
        if (element.id == botManager.config['ownerId']) {
          element.send(message.author.username + " is stopping the bot !")
        }
      });

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
  var args = message.content.split(" ").slice(1);

  if (!message.content.startsWith('>') || message.author.bot) return;
  let realargs = message.content.slice('>'.length).split(/ +/);
  let commandName = realargs.shift();
  let command = Bot.commands.get(commandName);

  if (command === undefined) {
    return;
  }

  if (command.getPermission() == 'miste' && message.author.id != botManager.config['ownerId']) {
    return message.reply("You don't have permission to use this command!");
  }

  try {
    command.executeCommand(message);
  } catch (error) {
    message.reply('There was an error executing this command.');
    console.log(error);
  }
});