const { ApplicationCommandOptionType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fetchQuery = require('../../utils/fetchQuery');
const arrayDuplicates = require('../../utils/arrayDuplicates');
const filterResults = require('../../utils/filterResults');
const formatSearchResponse = require('../../utils/formatSearchResponse');
const fs = require('fs');

module.exports = {
    name: 'search',
    description: 'Searches for a show / movie',
    // devOnly: Boolean,
    // testOnly: Boolean,
    // deleted: Boolean,
    options: [
        {
            name: 'query',
            description: 'The show / movie you\'re looking for.',
            required: true,
            type: ApplicationCommandOptionType.String
        },
        {
            name: 'type',
            description: 'Movie / show',
            required: true,
            type: ApplicationCommandOptionType.String
        }
    ],
    
    // permissionsRequired: [PermissionFlagBits.Administrator],
    // botPermissions: [PermissionFlagBits.Administrator],

    callback: async (client, interaction) => {
        const userQuery = interaction.options.get('query').value;
        let type = interaction.options.get('type').value.toLowerCase();

        if(type != 'movie' && type != 'show'){
            return interaction.reply({
                content: `You can only search for movies and shows.`,
                ephemeral: true
            });
        }

        if (type === 'show') {
            type = 'series'
        } else if (type === 'movie') {
            type = 'films'
        }

        const query = userQuery.replace(' ', '+') + `&p=${type}`;
        await interaction.deferReply();
        let finalResults = [];


        if(type === 'series') {

            async function getAndFilter(search, page) {

                const $ = await fetchQuery(search, page);
    
                // Extract all results names ie all .wa-sub-block-title
                // Href is $allResultsNames['0-9']['children']['1']['attribs']['href']
                // Name is $allResultsNames["0-9"]['children']["1"]['children']['1']['data']
                // Version is $allResultsNames["0-9"]['children']["1"]['children'][2]['children'][0]['data'].replace(' - ', '')
    
                // Extract all results covers ie all .cover
                // cover URL is $allResultsCovers['0-9']['children'][1]['children'][0]['attribs']['src']
    
                const $allResultsNames = $(".wa-sub-block-title");
                const $allResultsCovers = $(".cover");
                let resultsInfos = [];
    
                // Format of results: [["name", "link", "version", "cover URL"]]
    
                for (let i=0; i<$allResultsNames['length']; i++) {
                    resultsInfos.push([
                        $allResultsNames[`${i}`]['children']["1"]['children']['1']['data'].slice(1),
                        $allResultsNames[`${i}`]['children']['1']['attribs']['href'],
                        $allResultsNames[`${i}`]['children']["1"]['children'][2]['children'][0]['data'].replace(' - ', ''),
                        $allResultsCovers[`${i}`]['children'][1]['children'][0]['attribs']['src']
                    ]);
                }
    
                for(let finalResult of filterResults(resultsInfos)) {
                    finalResults.push(finalResult);
                }
    
                finalResults = finalResults.filter(function (el) {
                    return el != null;
                });
            }
    
            await getAndFilter(query, 1);
            let pageCount = 2;
    
            if(finalResults.length == 0) {
                await interaction.editReply(`I didn't find any result for your query`);
                return;
            } 
    
            let intCount = 0
            // Getting at least 10 results after filtering
            while(finalResults.length < 10) {
                await getAndFilter(query, pageCount);
                pageCount+=1;
                intCount+=1;
                if(intCount > 6) break;
            }
    
            // Extract the titles only from the results
            let finalTitles = [];
            for(let finalResult of finalResults) {
                finalTitles.push(finalResult[0]);
            }
    
            // If there are more than 10 results, remove duplicates
            if(finalResults.length > 10) {
                if(arrayDuplicates(finalTitles)[0]) {
                    for(let i = 0; i < arrayDuplicates(finalTitles)[1].length; i ++) {
                        if(finalResults.length > 10) {
                            delete finalResults[arrayDuplicates(finalTitles)[1][i]];
                            finalResults = finalResults.filter(function (el) {
                                return el != null;
                            });
                        }
                    }
                }
            }
    
            // If there are still more than 10 results, remove the last ones
            if(finalResults.length > 10) {
                while(finalResults.length > 10) {
                    finalResults.pop();
                }
            }

        }

        if(type === 'films') {

            async function getAndFilter(search, page) {

                const $ = await fetchQuery(search, page);
                const $allResultsNames = $(".wa-sub-block-title");
                const $allResultsCovers = $(".cover");
                // Name is $allResultsNames['0-9']['children'][1]['children'][1]['data'].slice(1)
                // Link is $allResultsNames['0-9']['children'][1]['attribs']['href']
                // Version is $allResultsNames['0-9']['children'][1]['children'][2]['children'][0]['data']
                // Cover is $allResultsCovers['0-9']['children'][1]['children'][0]['attribs']['src']
                let resultsInfos = [];
    
                // Format of results: [["name", "link", "version", "cover URL"]]
    
                for (let i=0; i<$allResultsNames['length']; i++) {
                    resultsInfos.push([
                        $allResultsNames[`${i}`]['children'][1]['children'][1]['data'].slice(1),
                        $allResultsNames[`${i}`]['children'][1]['attribs']['href'],
                        $allResultsNames[`${i}`]['children'][1]['children'][2]['children'][0]['data'].slice(1),
                        $allResultsCovers[`${i}`]['children'][1]['children'][0]['attribs']['src']
                    ]);
                }

                for(let finalResult of resultsInfos) {
                    finalResults.push(finalResult);
                }
    
                finalResults = finalResults.filter(function (el) {
                    return el != null;
                });
            }

            await getAndFilter(query, 1);

        }

        // Saving the results to a JSON file
        const resultsObject = {
            results: finalResults
        };

        const data = JSON.stringify(resultsObject);
        fs.writeFileSync('results.txt', data, error => {
            if(error) {
                console.log(`There was an error saving the results: ${error}`)
            }
        });

        // Adding buttons
        const row1 = new ActionRowBuilder();
        const row2 = new ActionRowBuilder();

        for(let i = 0; i < finalResults.length; i++){
            try {
                if(i < 5){
                    row1.components.push(
                        new ButtonBuilder().setCustomId(`${type}-search-${i}`).setLabel(`Result nº${i+1}`).setStyle(ButtonStyle.Primary)
                    );
                } else if(i >= 5) {
                    row2.components.push(
                        new ButtonBuilder().setCustomId(`${type}-search-${i}`).setLabel(`Result nº${i+1}`).setStyle(ButtonStyle.Primary)
                    );
                }

            } catch (error) {
                console.log(error);
            }
        }

        if(row2.components.length === 0) {
            await interaction.editReply({ embeds : formatSearchResponse(client, finalResults, userQuery, type), components: [row1] });
        } else {
            await interaction.editReply({ embeds : formatSearchResponse(client, finalResults, userQuery, type), components: [row1, row2] });
        }
    }
};
