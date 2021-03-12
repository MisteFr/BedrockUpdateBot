class ListEmojisCommand {
    static getName() {
        return 'listemojis';
    }

    static getDescription() {
        return 'Get all the emojis of the server you are in';
    }

    static getPermission() {
        return 'everyone';
    }

    static executeCommand(message) {
        message.channel.send(message.guild.emojis.cache.map(e => e.toString()).join(" "));
    }
}

module.exports = ListEmojisCommand;