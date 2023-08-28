const { devs, testServer } = require('../../../config.json');
const searchPage = require('../../buttons/searchPage');
const episodePage = require('../../buttons/episodePage');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

    if(interaction.isButton()) {

        if(interaction.customId.includes('search')) {

            searchPage(interaction);
            
        }

        if(interaction.customId.includes('episode')) {

            episodePage(interaction);
            
        }
    }

    const localCommands = getLocalCommands();
    try {
        const commandObject = localCommands.find((cmd) => cmd.name === interaction.commandName);

        if(!commandObject) return;

        if (commandObject.devOnly) {
            if (!devs.includes(interaction.member.id)) {
                interaction.reply({
                    content: `Only developers can run this command.`,
                    ephemeral: true
                });
                return;
            }
        }

        if (commandObject.testOnly) {
            if (!interaction.guild.id === testServer) {
                interaction.reply({
                    content: `This command can only be ran into the test server.`,
                    ephemeral: true
                });
                return;
            }
        }

        if (commandObject.permissionsRequired?.length) {
            for (const permission of commandObject.permissionsRequired) {
                if (!interaction.member.permissions.has(permission)) {
                    interaction.reply({
                        content: `Not enough permissions`,
                        ephemeral: true
                    });
                    return;
                }
            }
        }

        if (commandObject.botPermissions?.length) {
            for (const permission of commandObject.botPermissions) {
                const bot = interaction.guild.members.me;

                if(!bot.permissions.has(permission)) {
                    interaction.reply({
                        content: `I don't have enough permissions to run this command.`,
                        ephemeral: true
                    });
                    return;
                }
            }
        }

        await commandObject.callback(client, interaction);

    } catch (error) {
        console.log(`There was an error running this command: ${error}.`);
    }
}
