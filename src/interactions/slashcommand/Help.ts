import type { IShardClient } from '@core/_types/IShardClient';
import type { ILoggerService } from '@services/_types/insights/ILoggerService';
import type { ISlashCommand, SlashCommandData } from '@type/ISlashCommand';
import { EmbedBuilder } from '@utilities/EmbedBuilder';
import { resolveColor } from '@utilities/EmbedUtilities';
import type { CommandInteraction } from 'eris';

export class HelpCommand implements ISlashCommand {
    public data: SlashCommandData = {
        name: 'help',
        description: 'Show help menu'
    };

    public async run(
        logger: ILoggerService,
        _shardClient: IShardClient,
        interaction: CommandInteraction
    ): Promise<void> {
        logger.debug(`Handling '${this.data.name}' command...`);

        const embed = new EmbedBuilder()
            .setColor(resolveColor('RANDOM'))
            .setDescription('**Help Menu**');

        await interaction.createMessage({
            embeds: [embed.build()]
        });
    }
}

module.exports = new HelpCommand();
