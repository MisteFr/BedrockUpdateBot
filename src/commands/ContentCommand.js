require('./../BedrockUpdateBot.js');
var fs = require("fs");
const Discord = require('discord.js');

class ContentCommand {
    static getName() {
        return 'content';
    }

    static getDescription() {
        return 'Get details about a piece of content of the marketplace';
    }

    static getPermission() {
        return 'everyone';
    }

    static executeCommand(message) {
        let name = message.content.replace(">content ", "");
        if (name !== "") {
            var contents = fs.readFileSync("/home/MisteBot/MarketplaceData.json");
            var jsonContent = JSON.parse(contents);

            var found = false;
            for (var month in jsonContent["Marketplace"]) {
                if (month !== "totalCount") {
                    for (var content in jsonContent["Marketplace"][month]["results"]) {
                        let pieceOfContent = jsonContent["Marketplace"][month]["results"][content];

                        if ((pieceOfContent.title.neutral).toLowerCase() === name.toLowerCase()) {
                            found = true;

                            var embed = new Discord.RichEmbed()
                                .setTitle(pieceOfContent.title.neutral)
                                .setDescription(pieceOfContent.description.neutral)
                                .setImage(pieceOfContent.images[0].url)
                                .setColor('#0941a9')
                                .addField("Creator name", pieceOfContent.displayProperties.creatorName)
                                .addField("Content type", pieceOfContent.displayProperties.packIdentity[0].type)
                                .addField("Price", pieceOfContent.displayProperties.price)

                                let tagText = ""
                                for(var key in pieceOfContent.tags){
                                    if(pieceOfContent.tags[key].includes("tag")){
                                        if(tagText == ""){
                                            tagText = pieceOfContent.tags[key].split(".")[1]
                                        }else{
                                            tagText = tagText + ", " + pieceOfContent.tags[key].split(".")[1]
                                        }
                                    }
                                }
                                embed.addField("Tags", tagText)
                                embed.addField("Released Month", month)
                            if (pieceOfContent.averageRating) {
                                embed.addField("Average rating", pieceOfContent.averageRating)
                            }
                            if (pieceOfContent.totalRatingsCount) {
                                embed.addField("Total rating count", pieceOfContent.totalRatingsCount)
                            }
                            if (pieceOfContent.rating) {
                                let message = "";
                                if (pieceOfContent.rating.star5Count){
                                    message = message + "\n5:star:: " + pieceOfContent.rating.star5Count;
                                }
                                if (pieceOfContent.rating.star4Count){
                                    message = message + "\n4:star:: " + pieceOfContent.rating.star4Count;
                                }
                                if (pieceOfContent.rating.star3Count){
                                    message = message + "\n3:star:: " + pieceOfContent.rating.star3Count;
                                }
                                if (pieceOfContent.rating.star2Count){
                                    message = message + "\n2:star:: " + pieceOfContent.rating.star2Count;
                                }
                                if (pieceOfContent.rating.star1Count){
                                    message = message + "\n1:star:: " + pieceOfContent.rating.star1Count;
                                }
                                embed.addField("Rating", message)
                                embed.addField("Estimations (€)", (5* pieceOfContent.totalRatingsCount) + " - " + (11* pieceOfContent.totalRatingsCount))
                            }
                            embed.addField("uuid", pieceOfContent.id)
                            embed.setURL("https://www.minecraft.net/en-us/pdp/?id=" + pieceOfContent.id)
                            embed.setAuthor("BedrockUpdateBot", botManager.avatarURL)

                            message.channel.send(embed)
                        }
                    }
                }
            }
            if(found === false){
                message.channel.send("Can't find a piece of content with that name on the Marketplace.")
            }
        }
    }
}

module.exports = ContentCommand;