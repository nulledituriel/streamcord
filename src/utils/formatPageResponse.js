const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = (pageDetails, interaction, type) => {

    const rawResults = fs.readFileSync('results.txt', 'utf8');
    const resultsObject = JSON.parse(rawResults);
    const userID = interaction.customId.split('-search-')[1];
    const titleAndVersion = [resultsObject.results[userID][0], resultsObject.results[userID][2]];
    
    let embed = new EmbedBuilder();

    embed
    .setTitle(`Page details`)
    .setDescription(`Download ${titleAndVersion[0]} - ${titleAndVersion[1]}`)
    .setColor(0x18e1ee)
    .setThumbnail(`https://www.wawacity.homes/${resultsObject.results[userID][3]}`)
    .setTimestamp(Date.now())
    .setFooter({
        text: `Streamcord - Movies & Shows`
    });

    for(let detail in pageDetails) {
        embed.addFields({
            name: detail,
            value: pageDetails[detail]
        })
    }

    return embed;
}