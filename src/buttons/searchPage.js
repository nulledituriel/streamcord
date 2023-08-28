const fs = require('fs');
const formatPageResponse = require('../utils/formatPageResponse');
const fetchPage = require('../utils/fetchPage');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = async (interaction) => {

    try {
        // Get the results information
        const rawResults = fs.readFileSync('results.txt', 'utf8');
        const resultsObject = JSON.parse(rawResults);

        const type = interaction.customId.split('-search-')[0];
        const userID = interaction.customId.split('-search-')[1];
        
        const pagePath = resultsObject.results[userID][1];
        const $ = await fetchPage(pagePath);

        let details = {};
        let episodesDetails = [];

        if(type === 'series') {

            // Getting the episodes details

            const allTitles = $('table#DDLLinks .title');
            // Get episode title: allTitles[0-?]['children'][1]['children'][1]['children'][2]["data"].replace(' - ', '')

            const allLinks = $('table#DDLLinks .link-row');
            // Format for episodes: [[number, [{ site: link }], size]]
            // Remove the first one (fake)

            // Link: allLinks[1-?]['children'][1]['children'][1]['attribs']['href']
            // Site: allLinks[1-?]['children'][3]['children'][0]['data']
            // Size: allLinks[1-?]['children'][5]['children'][0]['data']

            for(let j = 0; j < allTitles.length; j++){
                let thisEpisode = [];
                thisEpisode.push(`${j+1}`);
                let sites = []
                let currentSize = '';
                for(let i = 1; i < allLinks.length/allTitles.length; i++) {
                    sites.push({ "site": allLinks[i]['children'][3]['children'][0]['data'], "link": allLinks[i]['children'][1]['children'][1]['attribs']['href'] });
                    currentSize = allLinks[i]['children'][5]['children'][0]['data']
                }
                thisEpisode.push(sites);
                thisEpisode.push(currentSize);
                episodesDetails.push(thisEpisode);
            }

            // Getting the page details

            const detailList = $('.detail-list');
            let episodeCount = detailList['0']['children'][7]['children'][2]['children'][0]['data'];
            let duration = detailList['0']['children'][9]['children'][2]['children'][0]['data'];
            let year = detailList['0']['children'][11]['children'][2]['children'][0]['children'][0]['data'];
            let genre = detailList['0']['children'][17]['children'][3]['children'][1]['children'][0]['data'];
            details = {
                "Number of episodes": episodeCount,
                "Duration": duration,
                'Year': year,
                'Genre': genre
            }

        } else if(type === 'films') {

            // Links details

            // Fomat for links : [[link-number, [{site: link}], size]]
            // Links: $allLinks['1-?']['children'][1]['children'][1]['attribs']['href'];
            // Site: $allLinks['1-?']['children'][3]['children'][0]['data']
            // Size: $allLinks['1-?']['children'][5]['children'][0]['data']
            const $allLinks = $('table#DDLLinks tr');
            
            for(let i = 1; i < $allLinks.length; i++) {
                let thisLink = [];
                thisLink.push(`${i}`);
                let sites = [];
                sites.push({ "site": $allLinks[`${i}`]['children'][3]['children'][0]['data'], "link": $allLinks[`${i}`]['children'][1]['children'][1]['attribs']['href'] });
                thisLink.push(sites);
                thisLink.push($allLinks[`${i}`]['children'][5]['children'][0]['data']);

                episodesDetails.push(thisLink);
            }

            // Page details
            // 5 7 13

            const $detailList = $('.detail-list');
            let duration = $detailList['0']['children'][5]['children'][2]['children'][0]['data'];
            let genre = $('#detail-page > div:nth-child(3) > div.wa-block-body.detail.row > div.col-md-8.wa-post-detail-list > ul > li:nth-child(7) > b > a:nth-child(1)')['0']['children'][0]['data'];
            details = {
                "Duration": duration,
                "Genre": genre
            }

        }

        // Getting the embed
        
        let embed = formatPageResponse(details, interaction, type);

        // Buttons
        let numberOfRows = Math.floor(episodesDetails.length/5);
        if(episodesDetails.length % 5 != 0) {
            numberOfRows += 1;
        }

        let rows = [];

        if(type === 'series') {

            for (let i = 0; i < episodesDetails.length; i++) {
                const button = new ButtonBuilder()
                    .setCustomId(`${type}-episode-${i}`)
                    .setLabel(`Episode nº${i + 1}`)
                    .setStyle(ButtonStyle.Primary);
            
                // Create a new row if the current row is full or it's the first row
                if (i % 5 === 0 || i === 0) {
                    const row = new ActionRowBuilder();
                    row.components.push(button)
                    rows.push(row);
                } else {
                    // Add the button to the last row
                    rows[rows.length - 1].components.push(button);
                }
            }
            
        } else if(type === 'films') {

            for (let i = 0; i < episodesDetails.length; i++) {
                const button = new ButtonBuilder()
                    .setCustomId(`${type}-episode-${i}`)
                    .setLabel(`Link nº${i + 1}`)
                    .setStyle(ButtonStyle.Primary);
            
                // Create a new row if the current row is full or it's the first row
                if (i % 5 === 0 || i === 0) {
                    const row = new ActionRowBuilder();
                    row.components.push(button)
                    rows.push(row);
                } else {
                    // Add the button to the last row
                    rows[rows.length - 1].components.push(button);
                }
            }

        }

        // Saving to JSON
        const episodesObject = {
            episodes: episodesDetails
        };

        const data = JSON.stringify(episodesObject);
        fs.writeFileSync('episodes.txt', data, error => {
            if(error) {
                console.log(`There was an error saving the results: ${error}`)
            }
        });

        //Sending the embed

        interaction.reply({ embeds: [embed], components: rows });

    } catch (error) {
        console.log(error);
    }

}