const Discord = require('discord.js');
const Bot = new Discord.Client();

var BedrockUpdateBotManager = require('./manager/BedrockUpdateBotManager');

global.botManager = new BedrockUpdateBotManager()

Bot.login(botManager.config["botToken"]);

Bot.on('ready', () => {
  botManager.init(Bot)
});

Bot.on('error', e => {
  console.error(e);
  Bot.users.forEach(function (element) {
    if (element.username == "Miste") {
      element.send("[ERROR] " + e.message);
    }
  });
});


Bot.on('message', message => {

  if (botManager.needConfirmation === true && message.author.username === botManager.needConfirmationAuthor) {
    if (message.content === (botManager.needConfirmationAuthor + " confirms that he wants to stop this bot")) {
      message.channel.send(message.author.username + " is stopping the bot !")
      message.channel.send("Shutting down ...")
      Bot.users.forEach(function (element) {
        if (element.username == "Miste") {
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

  if (message.author.username == "MCPE Google Play Updates" && message.channel.name == "updates") {
    if (message.content.includes("APK file now available for com.mojang.minecraftpe " + botManager.config["lastVersionReleased"]) && message.content.includes("arm")) {
      require('./decompiler/Decompiler.js').checkMessage(message);
    }
  }

  if (message.author.username == "MCPE Google Play Updates" && message.embeds[0] !== undefined) {
    if (message.embeds[0].title !== botManager.config["lastVersionAndroid"] && (message.embeds[0].title.replace(/[-)(]/g, '')).replace(/[- )(]/g, '_') !== botManager.config["lastVersionAndroidBeta"] && typeof message.embeds[0].description === 'undefined') {
      console.log(message.embeds[0].title);

      if (message.embeds[0].title.includes("(beta)")) {
        Bot.users.forEach(function (element) {
          if (element.username == "Miste") {
            element.send("A new version is out on the GooglePlayStore for beta users ! (" + message.embeds[0].title + ")");
            botManager.config["lastVersionAndroidBeta2"] = botManager.config["lastVersionAndroidBeta"];
            botManager.config["lastVersionAndroidBeta"] = (message.embeds[0].title.replace(/[-)(]/g, '')).replace(/[- )(]/g, '_');
            botManager.config["lastVersionReleased"] = (message.embeds[0].title.replace("(beta)", "")).replace(/\s/g, '');
            botManager.config["lastVersionReleasedIsBeta"] = true;
            botManager.saveConfig()
            var embed = new Discord.RichEmbed()
              .setTitle(`A new version is out on the Google Play Store for beta users: ` + message.embeds[0].title + " :pushpin:")
              .setColor('#0941a9')
              .setAuthor("BedrockUpdateBot", botManager.avatarURL)
            botManager.channelToSend3.send({ embed })
            embed.setFooter("Made with ❤ by Miste (https://twitter.com/Misteboss_mcpe)", "https://cdn.discordapp.com/avatars/198825092547870721/ac3aa3645c92a29a0a7de0957d3622fb.png")
            //channelToSend4.send({ embed })
            botManager.channelToSend2.send({ embed })
            botManager.channelToTest.send("A new version is out on the GooglePlayStore for beta users! (" + message.embeds[0].title + ") ");
          }
        });
        botManager.client.post('statuses/update', { status: '📌 A new version is out on the Google Play Store for beta users: ' + botManager.config["lastVersionAndroidBeta"] + " !\n\n#RT" }, function (error, tweet, response) { });
      } else if (message.embeds[0].title.match(/^[0-9. ]+$/) != null) {
        Bot.users.forEach(function (element) {
          if (element.username == "Miste") {
            element.send("A new version is out on the GooglePlayStore ! (" + message.embeds[0].title + ")");
            botManager.config["lastVersionAndroid2"] = botManager.config["lastVersionAndroid"];
            botManager.config["lastVersionAndroid"] = message.embeds[0].title;
            botManager.config["lastVersionReleased"] = message.embeds[0].title;
            botManager.config["lastVersionReleasedIsBeta"] = false;
            botManager.saveConfig()
            var embed = new Discord.RichEmbed()
              .setTitle(`A new version is out on the Google Play Store: ` + botManager.config["lastVersionAndroid"] + " :pushpin:")
              .setColor('#0941a9')
              .setAuthor("BedrockUpdateBot", botManager.avatarURL)
            botManager.channelToSend3.send({ embed })
            embed.setFooter("Made with ❤ by Miste (https://twitter.com/Misteboss_mcpe)", "https://cdn.discordapp.com/avatars/198825092547870721/ac3aa3645c92a29a0a7de0957d3622fb.png")
            //botManager.channelToSend4.send({ embed })
            botManager.channelToSend2.send({ embed })
            botManager.channelToTest.send("A new version is out on the GooglePlayStore ! (" + message.embeds[0].title + ") ");
          }
        });
        botManager.client.post('statuses/update', { status: '📌 A new version is out on the Google Play Store: ' + botManager.config["lastVersionAndroid"] + " !\n\n#RT" }, function (error, tweet, response) { });
      }
    }
  }

  if (!message.content.startsWith('>') || message.author.bot) return;
  let realargs = message.content.slice('>'.length).split(/ +/);
  let commandName = realargs.shift();
  let command = Bot.commands.get(commandName);

  if (command === undefined) {
    return;
  }

  if (command.getPermission() == 'miste' && message.author.username !== "Miste") {
    message.reply("You don't have permission to use this command!");
  }

  try {
    command.executeCommand(message);
  } catch (error) {
    message.reply('There was an error executing this command.');
    console.log(error);
  }
});

function sleep(sleepDuration) {
  var now = new Date().getTime();
  while (new Date().getTime() < now + sleepDuration) { /* do nothing (doesnt affect the child process)*/ }
}