const { EmbedBuilder } = require('discord.js');

module.exports = (client, results, userQuery) => {
    let embed = new EmbedBuilder()
    .setTitle(`Search complete`)
    .setDescription(`You asked for \`${userQuery}\`, here's what I found.`)
    .setColor(0x18e1ee)
    .setThumbnail(`https://www.wawacity.homes/${results[0][3]}`)
    .setTimestamp(Date.now())
    .setFooter({
        text: `Streamcord - Movies & Shows`
    });

    for(let i = 0; i < results.length; i++) {
        embed.addFields(
            { name: `\`${i+1}\` ${results[i][0]}`, value: `Version: ${results[i][2]}.`, inline: true }
        );
    }
    return [embed];
}