const Discord = require('discord.js');

class EvalCommand {
    static getName() {
        return 'eval';
    }

    static getDescription() {
        return '';
    }

    static getPermission() {
        return 'miste';
    }

    static executeCommand(message) {
        var args = message.content.split(" ").slice(1);
        let embed = new Discord.RichEmbed();

        embed.setTitle("Eval:");
        embed.setDescription([
            "`" + args.join(" ") + "`",
            "```Evaluating...```",
        ].join("\n"));

        message.channel.send(embed).then(msg => {
            let time = Date.now();
            this.safe_eval(args.join(" "), message)
                .then(result => {
                    time = Date.now() - time;
                    embed.setTitle("Eval'd:");
                    embed.setDescription([
                        "`" + args.join(" ") + "`:",
                        "```" + result + "```",
                        `Took ${time}ms to finish.`
                    ].join("\n"));
                    msg.edit(embed);
                })
                .catch(result => {
                    time = Date.now() - time;
                    embed.setTitle("Eval'd:");
                    embed.setDescription([
                        "`" + args.join(" ") + "`:",
                        "```" + result + "```",
                        `Took ${time}ms to finish.`
                    ].join("\n"));
                    msg.edit(embed);
                });
        });
    }

    static safe_eval(cmd, message){
        return new Promise((resolve, reject) => {
          let result;
            try {
                result = eval(cmd);
            } catch(e) {
                reject(e);
                return;
            }
            resolve(result);
        });
      }
}

module.exports = EvalCommand;