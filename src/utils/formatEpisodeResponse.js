const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = (episode, interaction, type) => {

    let embed = new EmbedBuilder()
    .setColor(0x18e1ee)
    .setTimestamp(Date.now())
    .setFooter({
        text: `Streamcord - Movies & Shows`
    });
    
    if(type === 'series') {

        embed
        .setTitle(`Your Episode`)
        .setDescription(`Episode ${episode[0]} - Size: ${episode[2]}`);
        for(let i = 0; i < episode[1].length; i++) {
            embed.addFields({ name: episode[1][i]['site'], value: `[Click here](${episode[1][i]['link']})` });
        }
        
    } else if (type === 'films') {

        embed
        .setTitle(`Your Movie`)
        .setDescription(`Size: ${episode[0][2]}`);
        for(let i = 0; i < episode.length; i++) {
            embed.addFields({ name: episode[i][1][0]['site'], value: `[Click here](${episode[i][1][0]['link']})` });
        }
    }

    return [embed];
}