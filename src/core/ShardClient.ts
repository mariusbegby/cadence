import type { ShardClientConfig } from '@config/types';
import type { IShardClient } from '@core/_types/IShardClient';
import { EventManager } from '@events/EventManager';
import type { ILoggerService } from '@type/insights/ILoggerService';
import type { ISlashCommand } from '@type/ISlashCommand';
import Eris, { Client } from 'eris';
import { availableParallelism } from 'node:os';
import { join } from 'node:path';

export class ShardClient implements IShardClient {
    private _logger: ILoggerService;
    private _shardClientConfig: ShardClientConfig;
    private _shardClient: Client;
    private _applicationId: string;

    constructor(logger: ILoggerService, shardClientConfig: ShardClientConfig) {
        this._logger = logger;
        this._shardClientConfig = shardClientConfig;
        this._logger.debug(this._shardClientConfig, 'Shard client config');

        const token = process.env.DISCORD_BOT_TOKEN || '';
        const applicationId = process.env.DISCORD_APPLICATION_ID || '';
        this._applicationId = applicationId;
        this._logger.debug(`Application ID: ${this._applicationId}`);
        this._shardClient = new Client(token, {
            intents: this._shardClientConfig.intents,
            shardConcurrency: this._shardClientConfig.shardConcurrency ?? 'auto',
            firstShardID: this._shardClientConfig.firstShardID ?? 0,
            lastShardID: this._shardClientConfig.lastShardID ?? undefined,
            maxShards: this._shardClientConfig.maxShards ?? 'auto',
            getAllUsers: false
        });

        this._shardClient.application = {
            id: this._applicationId,
            flags: 1 << 23
        };
    }

    public async start() {
        const eventsPath = join(__dirname, '..', 'events');
        const eventManager = new EventManager(this._logger, this, eventsPath);

        this._logger.debug('Starting shard client...');
        try {
            this._logger.debug('Connecting client to Discord...');
            await this._shardClient.connect();
            this._logger.debug('Successfully connected client to Discord!');
            this._shardClient.editStatus('online', [
                {
                    name: '/help 🎶',
                    type: Eris.Constants.ActivityTypes.LISTENING
                }
            ]);
        } catch (error: unknown) {
            this._logger.error(error, 'An error occurred while connecting to the Discord gateway.');
            this._logger.warn('Make sure the DISCORD_BOT_TOKEN environment variable is set and valid.');
        }
        this._logger.debug('Successfully started shard client.');

        eventManager.loadEventHandlers();
    }

    public registerEventListener(eventName: string, once: boolean, listener: () => void): void {
        this._logger.debug(`Registering ShardClient event listener for '${eventName}' event...`);
        once ? this._shardClient.once(eventName, listener) : this._shardClient.on(eventName, listener);
    }

    public removeAllListeners(): void {
        this._logger.debug('Removing all event listeners...');
        this._shardClient.removeAllListeners();
    }

    public setMaxListeners(maxListeners: number): void {
        this._logger.debug(`Setting max listeners to ${maxListeners}...`);
        this._shardClient.setMaxListeners(maxListeners);
    }

    public getShardId(guildId?: string): number {
        return guildId ? this._shardClient.guilds.get(guildId)?.shard.id ?? -1 : -1;
    }

    public getShardCount(): number {
        return this._shardClient.shards.size;
    }

    public getWorkerShardCount(): number {
        if (this._shardClientConfig.maxShards === 'auto') {
            return availableParallelism();
        }
        return this._shardClientConfig.maxShards ?? 1;
    }

    public getGlobalShardCount(): number {
        const globalShardCount = process.env.GLOBAL_SHARD_COUNT || '1';
        if (globalShardCount.toLowerCase() === 'auto') {
            return availableParallelism();
        }
        return Number.parseInt(globalShardCount);
    }

    public async deployCommand(command: ISlashCommand): Promise<Eris.ApplicationCommand> {
        const slashCommandData: Eris.ChatInputApplicationCommand = {
            ...command.data,
            // biome-ignore lint/style/useNamingConvention: <explanation>
            application_id: this._applicationId,
            type: Eris.Constants.ApplicationCommandTypes.CHAT_INPUT,
            id: command.data.name
        };
        return await this._shardClient.createCommand(slashCommandData);
    }

    public async getCommands(): Promise<Eris.ApplicationCommand[]> {
        return await this._shardClient.getCommands();
    }

    public async deleteCommands(): Promise<void> {
        const commands = await this.getCommands();
        for (const command of commands) {
            this._logger.debug(`Deleting slash command '${command.name}'...`);
            await this._shardClient.deleteCommand(command.id);
        }
    }
}
