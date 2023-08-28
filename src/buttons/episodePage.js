const fs = require('fs');
const formatEpisodeResponse = require('../utils/formatEpisodeResponse');

module.exports = (interaction) => {

    // Get the page information
    const rawEpisodes = fs.readFileSync('episodes.txt', 'utf8');
    const episodesObject = JSON.parse(rawEpisodes);
    
    const type = interaction.customId.split('-episode-')[0];
    let currentEpisode

    if(type === 'series') {
        const episodeNumber = interaction.customId.split('-episode-')[1];
        currentEpisode = episodesObject['episodes'][episodeNumber];
    } else if(type === 'films') {
        currentEpisode = episodesObject['episodes'];
    }

    let embed = formatEpisodeResponse(currentEpisode, interaction, type);
    interaction.reply({ embeds: embed });

}
