import { CoreValidator } from '@core/CoreValidator';
import { MockLoggerService } from '@mocks/MockLoggerService';
import type { IConfig } from 'config';
import type { exec } from 'child_process';
import type { HealthCheckConfig, ShardClientConfig, LoggerServiceConfig } from '@config/types';

describe('CoreValidator', () => {
    let mockLoggerService = new MockLoggerService();
    let mockConfig: Partial<IConfig>;
    let mockExecute: Partial<typeof exec>;
    let mockFetch: Partial<typeof fetch>;
    let mockLoadedConfiguration: {
        shardClientConfig?: ShardClientConfig;
        loggerServiceConfig?: LoggerServiceConfig;
        healthCheckConfig?: HealthCheckConfig;
    };
    let mockPackageJson: {
        version: string;
        repository: {
            url: string;
        };
    };
    let mockLatestVersion: string;
    let coreValidator: CoreValidator;

    function updateTestSetup() {
        if (!mockLoadedConfiguration) {
            mockLoadedConfiguration = {
                shardClientConfig: {} as ShardClientConfig,
                loggerServiceConfig: {} as LoggerServiceConfig,
                healthCheckConfig: {} as HealthCheckConfig
            };
        }

        if (!mockConfig) {
            mockConfig = {
                util: {
                    loadFileConfigs: jest.fn().mockReturnValue(mockLoadedConfiguration),
                    extendDeep: jest.fn(),
                    cloneDeep: jest.fn(),
                    setPath: jest.fn(),
                    equalsDeep: jest.fn(),
                    diffDeep: jest.fn(),
                    makeHidden: jest.fn(),
                    makeImmutable: jest.fn(),
                    getEnv: jest.fn(),
                    getConfigSources: jest.fn(),
                    toObject: jest.fn(),
                    setModuleDefaults: jest.fn()
                }
            };
        }

        if (!mockExecute) {
            mockExecute = jest.fn((command, callback) => {
                if (callback) {
                    callback(null, `Dependency check for ${command} passed`, '');
                }
            }) as unknown as typeof exec;
        }

        if (!mockFetch) {
            mockFetch = jest.fn((url) => {
                if (url === 'https://api.github.com/repos/user/repo/releases/latest') {
                    return Promise.resolve({
                        json: jest.fn().mockResolvedValue({
                            tag_name: mockLatestVersion
                        })
                    });
                }
                return Promise.resolve({
                    json: jest.fn().mockResolvedValue({
                        message: 'Not Found',
                        documentation_url: 'https://docs.github.com/rest/releases/releases#get-the-latest-release',
                        status: '404'
                    })
                });
            }) as unknown as typeof fetch;
        }

        if (!mockPackageJson) {
            mockPackageJson = {
                version: '1.0.0',
                repository: { url: 'https://github.com/user/repo' }
            };
        }

        if (!mockLatestVersion) {
            mockLatestVersion = '1.0.0';
        }

        coreValidator = new CoreValidator(
            mockLoggerService,
            mockConfig as IConfig,
            mockExecute as typeof exec,
            mockFetch as typeof global.fetch,
            mockPackageJson
        );
    }

    // create mock of exec function
    jest.mock('child_process', () => {
        return {
            exec: jest.fn((command, callback) => {
                if (callback) {
                    callback(null, `Dependency check for ${command} passed`, '');
                }
            }) as unknown as typeof exec
        };
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // mock process.exit to prevent the application from exiting but still stop execution
        process.exit = jest.fn().mockImplementation(() => {
            throw new Error('[MOCK] process.exit() called');
        }) as unknown as typeof process.exit;

        delete process.env.NODE_ENV;
        delete process.env.DISCORD_BOT_TOKEN;
        delete process.env.DISCORD_APPLICATION_ID;
        delete process.env.GLOBAL_SHARD_COUNT;
        delete process.env.SHARD_COUNT;
        delete process.env.WORKER_COUNT;
        delete process.env.YT_EXTRACTOR_AUTH;
        delete process.env.YT_EXTRACTOR_AUTH_1;
        delete process.env.YT_EXTRACTOR_AUTH_2;

        process.env.NODE_ENV = 'development';
        process.env.DISCORD_BOT_TOKEN = 'bot-token';
        process.env.DISCORD_APPLICATION_ID = '12345';
        process.env.GLOBAL_SHARD_COUNT = 'AUTO';
        process.env.SHARD_COUNT = 'AUTO';
        process.env.WORKER_COUNT = 'AUTO';

        mockLoggerService = new MockLoggerService();
        updateTestSetup();
    });

    describe('validateConfiguration', () => {
        it('should validate the configuration', async () => {
            // Arrange
            mockLoadedConfiguration = {
                shardClientConfig: {} as ShardClientConfig,
                loggerServiceConfig: {} as LoggerServiceConfig,
                healthCheckConfig: {} as HealthCheckConfig
            };
            updateTestSetup();

            // Act
            await coreValidator.validateConfiguration();

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Validating configuration...');
            expect(mockLoggerService.debug).toHaveBeenCalledWith(mockLoadedConfiguration, 'Using configuration:');
            expect(mockLoggerService.error).not.toHaveBeenCalled();
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Successfully validated configuration.');
        });

        it('should throw an error if a required configuration option is missing', async () => {
            // Arrange
            const loadedConfiguration = {
                shardClientConfig: {}
            };
            mockConfig = {
                util: {
                    loadFileConfigs: jest.fn().mockReturnValue(loadedConfiguration),
                    extendDeep: jest.fn(),
                    cloneDeep: jest.fn(),
                    setPath: jest.fn(),
                    equalsDeep: jest.fn(),
                    diffDeep: jest.fn(),
                    makeHidden: jest.fn(),
                    makeImmutable: jest.fn(),
                    getEnv: jest.fn(),
                    getConfigSources: jest.fn(),
                    toObject: jest.fn(),
                    setModuleDefaults: jest.fn()
                }
            };
            updateTestSetup();

            // Act
            await expect(coreValidator.validateConfiguration()).rejects.toThrow(
                'Missing the following required configuration options: loggerServiceConfig, healthCheckConfig.'
            );

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Validating configuration...');
            expect(mockLoggerService.debug).toHaveBeenCalledWith(loadedConfiguration, 'Using configuration:');
            expect(mockLoggerService.error).toHaveBeenCalledWith(
                'Missing the following required configuration options: loggerServiceConfig, healthCheckConfig.'
            );
            expect(mockLoggerService.info).not.toHaveBeenCalled();
        });
    });

    describe('checkDependencies', () => {
        it('should check for required dependencies', async () => {
            // Act
            await coreValidator.checkDependencies();

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Checking for required dependencies...');
            expect(mockLoggerService.error).not.toHaveBeenCalled();
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Successfully checked required dependencies.');
        });

        it('should throw an error if a ffmpeg is missing', async () => {
            // Arrange
            mockExecute = jest.fn((command, callback) => {
                if (callback) {
                    if (command === 'ffmpeg -version') {
                        callback(new Error(`Dependency check for ${command} failed`), null, '');
                    } else {
                        callback(null, `Dependency check for ${command} passed`, '');
                    }
                }
            }) as unknown as typeof exec;

            updateTestSetup();

            // Act
            await expect(coreValidator.checkDependencies()).rejects.toThrow(
                'Dependency check for ffmpeg -version failed'
            );

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Checking for required dependencies...');
            expect(mockLoggerService.error).toHaveBeenCalledWith('FFmpeg is not installed on your system.');
            expect(mockLoggerService.error).toHaveBeenCalledWith('Make sure you have FFmpeg installed and try again.');
            expect(mockLoggerService.error).toHaveBeenCalledWith(
                'If you are using Windows, make sure to add FFmpeg to your PATH.'
            );
            expect(mockLoggerService.info).not.toHaveBeenCalled();
        });

        it('should warn if running non-supported Node.js version', async () => {
            // Arrange
            mockExecute = jest.fn((command, callback) => {
                if (callback) {
                    if (command === 'node -v') {
                        callback(null, 'v18.0.0-TEST', '');
                    } else {
                        callback(null, `Dependency check for ${command} passed`, '');
                    }
                }
            }) as unknown as typeof exec;

            updateTestSetup();

            // Act
            await coreValidator.checkDependencies();

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Checking for required dependencies...');
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Detected Node.js version: v18.0.0-TEST');
            expect(mockLoggerService.warn).toHaveBeenCalledWith(
                'Node.js version is below supported version 20. Please consider upgrading to LTS version.'
            );
            expect(mockLoggerService.error).not.toHaveBeenCalled();
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Successfully checked required dependencies.');
        });

        it('should log error if error occurs while checking Node.js version', async () => {
            // Arrange
            mockExecute = jest.fn((command, callback) => {
                if (callback) {
                    if (command === 'node -v') {
                        callback(new Error('An error occurred'), null, '');
                    } else {
                        callback(null, `Dependency check for ${command} passed`, '');
                    }
                }
            }) as unknown as typeof exec;

            updateTestSetup();

            // Act
            await expect(coreValidator.checkDependencies()).rejects.toThrow('An error occurred');

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Checking for required dependencies...');
            expect(mockLoggerService.error).toHaveBeenCalledWith(
                'An error occurred while checking Node.js version. Exiting...'
            );
            expect(mockLoggerService.info).not.toHaveBeenCalled();
        });
    });

    describe('validateEnvironmentVariables', () => {
        it('should validate the environment variables', async () => {
            // Arrange
            // mock environment variables
            process.env.NODE_ENV = 'development';
            process.env.DISCORD_BOT_TOKEN = 'bot-token';
            process.env.DISCORD_APPLICATION_ID = '12345';
            process.env.GLOBAL_SHARD_COUNT = 'AUTO';
            process.env.SHARD_COUNT = 'AUTO';
            process.env.WORKER_COUNT = 'AUTO';

            // Act
            await coreValidator.validateEnvironmentVariables();

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Validating environment variables...');
            expect(mockLoggerService.debug).toHaveBeenCalledWith('NODE_ENV is set to development.');
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Required environment variables are set.');
            expect(mockLoggerService.error).not.toHaveBeenCalled();
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Successfully validated environment variables.');
        });

        it('should throw an error if NODE_ENV is not set to development or production', async () => {
            // Arrange
            process.env.NODE_ENV = 'test';
            process.env.DISCORD_BOT_TOKEN = 'bot-token';
            process.env.DISCORD_APPLICATION_ID = '12345';
            process.env.GLOBAL_SHARD_COUNT = 'AUTO';
            process.env.SHARD_COUNT = 'AUTO';
            process.env.WORKER_COUNT = 'AUTO';

            // Act
            await expect(coreValidator.validateEnvironmentVariables()).rejects.toThrow('[MOCK] process.exit() called');

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Validating environment variables...');
            expect(mockLoggerService.error).toHaveBeenCalledWith(
                'NODE_ENV is not set to development or production. Please set it to either of these values. Exiting...'
            );
            expect(mockLoggerService.info).not.toHaveBeenCalled();
        });

        it('should throw an error if DISCORD_BOT_TOKEN is not set', async () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            process.env.DISCORD_BOT_TOKEN = '';
            process.env.DISCORD_APPLICATION_ID = '12345';
            process.env.TOTAL_SHARDS = 'AUTO';

            // Act
            await expect(coreValidator.validateEnvironmentVariables()).rejects.toThrow('[MOCK] process.exit() called');

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Validating environment variables...');
            expect(mockLoggerService.error).toHaveBeenCalledWith(
                'Missing the following required environment variables: DISCORD_BOT_TOKEN. Exiting...'
            );
            expect(mockLoggerService.info).not.toHaveBeenCalled();
        });

        it('should throw an error if DISCORD_APPLICATION_ID is not set', async () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            process.env.DISCORD_BOT_TOKEN = 'bot-token';
            process.env.DISCORD_APPLICATION_ID = '';
            process.env.TOTAL_SHARDS = 'AUTO';

            // Act
            await expect(coreValidator.validateEnvironmentVariables()).rejects.toThrow('[MOCK] process.exit() called');

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Validating environment variables...');
            expect(mockLoggerService.error).toHaveBeenCalledWith(
                'Missing the following required environment variables: DISCORD_APPLICATION_ID. Exiting...'
            );
            expect(mockLoggerService.info).not.toHaveBeenCalled();
        });

        it('should throw an error when multiple environment variables are missing', async () => {
            // Arrange
            process.env.NODE_ENV = '';
            process.env.DISCORD_BOT_TOKEN = '';
            process.env.DISCORD_APPLICATION_ID = '';
            process.env.TOTAL_SHARDS = 'AUTO';

            // Act
            await expect(coreValidator.validateEnvironmentVariables()).rejects.toThrow('[MOCK] process.exit() called');

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Validating environment variables...');
            expect(mockLoggerService.error).toHaveBeenCalledWith(
                'Missing the following required environment variables: NODE_ENV, DISCORD_BOT_TOKEN, DISCORD_APPLICATION_ID. Exiting...'
            );
            expect(mockLoggerService.info).not.toHaveBeenCalled();
        });

        it('should throw an error if GLOBAL_SHARD_COUNT is not set to AUTO or a valid number', async () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            process.env.DISCORD_BOT_TOKEN = 'bot-token';
            process.env.DISCORD_APPLICATION_ID = '12345';
            process.env.GLOBAL_SHARD_COUNT = 'test';
            process.env.SHARD_COUNT = 'AUTO';
            process.env.WORKER_COUNT = 'AUTO';

            // Act
            await expect(coreValidator.validateEnvironmentVariables()).rejects.toThrow('[MOCK] process.exit() called');

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Validating environment variables...');
            expect(mockLoggerService.error).toHaveBeenCalledWith(
                'GLOBAL_SHARD_COUNT is not set to AUTO or a valid number. Please set it to AUTO or the total number of shards. Exiting...'
            );
            expect(mockLoggerService.info).not.toHaveBeenCalled();
        });

        it('should throw an error if SHARD_COUNT is not set to AUTO or a valid number', async () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            process.env.DISCORD_BOT_TOKEN = 'bot-token';
            process.env.DISCORD_APPLICATION_ID = '12345';
            process.env.GLOBAL_SHARD_COUNT = 'AUTO';
            process.env.SHARD_COUNT = 'test';
            process.env.WORKER_COUNT = 'AUTO';

            // Act
            await expect(coreValidator.validateEnvironmentVariables()).rejects.toThrow('[MOCK] process.exit() called');

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Validating environment variables...');
            expect(mockLoggerService.error).toHaveBeenCalledWith(
                'SHARD_COUNT is not set to AUTO or a valid number. Please set it to AUTO or the total number of shards. Exiting...'
            );
            expect(mockLoggerService.info).not.toHaveBeenCalled();
        });

        it('should throw an error if WORKER_COUNT is not set to AUTO or a valid number', async () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            process.env.DISCORD_BOT_TOKEN = 'bot-token';
            process.env.DISCORD_APPLICATION_ID = '12345';
            process.env.GLOBAL_SHARD_COUNT = 'AUTO';
            process.env.SHARD_COUNT = 'AUTO';
            process.env.WORKER_COUNT = 'test';

            // Act
            await expect(coreValidator.validateEnvironmentVariables()).rejects.toThrow('[MOCK] process.exit() called');

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Validating environment variables...');
            expect(mockLoggerService.error).toHaveBeenCalledWith(
                'WORKER_COUNT is not set to AUTO or a valid number. Please set it to AUTO or the total number of shards. Exiting...'
            );
            expect(mockLoggerService.info).not.toHaveBeenCalled();
        });

        it('should throw an error if GLOBAL_SHARD_COUNT is lower than SHARD_COUNT', async () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            process.env.DISCORD_BOT_TOKEN = 'bot-token';
            process.env.DISCORD_APPLICATION_ID = '12345';
            process.env.GLOBAL_SHARD_COUNT = '1';
            process.env.SHARD_COUNT = '2';
            process.env.WORKER_COUNT = '2';

            // Act
            await expect(coreValidator.validateEnvironmentVariables()).rejects.toThrow('[MOCK] process.exit() called');

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Validating environment variables...');
            expect(mockLoggerService.error).toHaveBeenCalledWith(
                'GLOBAL_SHARD_COUNT (1) is lower than SHARD_COUNT (2). Please adjust the configuration accordingly.'
            );
            expect(mockLoggerService.info).not.toHaveBeenCalled();
        });

        it('should throw an error if SHARD_COUNT is lower than WORKER_COUNT', async () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            process.env.DISCORD_BOT_TOKEN = 'bot-token';
            process.env.DISCORD_APPLICATION_ID = '12345';
            process.env.GLOBAL_SHARD_COUNT = '2';
            process.env.SHARD_COUNT = '1';
            process.env.WORKER_COUNT = '2';

            // Act
            await expect(coreValidator.validateEnvironmentVariables()).rejects.toThrow('[MOCK] process.exit() called');

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Validating environment variables...');
            expect(mockLoggerService.error).toHaveBeenCalledWith(
                'SHARD_COUNT (1) is lower than WORKER_COUNT (2). Please adjust the configuration accordingly.'
            );
            expect(mockLoggerService.info).not.toHaveBeenCalled();
        });

        it('should throw an error if GLOBAL_SHARD_COUNT is lower than WORKER_COUNT', async () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            process.env.DISCORD_BOT_TOKEN = 'bot-token';
            process.env.DISCORD_APPLICATION_ID = '12345';
            process.env.GLOBAL_SHARD_COUNT = '2';
            process.env.SHARD_COUNT = '2';
            process.env.WORKER_COUNT = '3';

            // Act
            await expect(coreValidator.validateEnvironmentVariables()).rejects.toThrow('[MOCK] process.exit() called');

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Validating environment variables...');
            expect(mockLoggerService.error).toHaveBeenCalledWith(
                'GLOBAL_SHARD_COUNT (2) is lower than WORKER_COUNT (3). Please adjust the configuration accordingly.'
            );
            expect(mockLoggerService.info).not.toHaveBeenCalled();
        });

        it('should log a warning if YT_EXTRACTOR_AUTH is not set', async () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            process.env.DISCORD_BOT_TOKEN = 'bot-token';
            process.env.DISCORD_APPLICATION_ID = '12345';
            process.env.TOTAL_SHARDS = 'AUTO';
            // biome-ignore lint/performance/noDelete: <explanation>
            delete process.env.YT_EXTRACTOR_AUTH;

            // Act
            await coreValidator.validateEnvironmentVariables();

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Validating environment variables...');
            expect(mockLoggerService.warn).toHaveBeenCalledWith(
                'YT_EXTRACTOR_AUTH token is not set. This is required for the YouTube extractor to work properly.'
            );
            expect(mockLoggerService.error).not.toHaveBeenCalled();
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Successfully validated environment variables.');
        });

        it('should log a warning if any YT_EXTRACTOR_AUTH is not valid', async () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            process.env.DISCORD_BOT_TOKEN = 'bot-token';
            process.env.DISCORD_APPLICATION_ID = '12345';
            process.env.TOTAL_SHARDS = 'AUTO';
            process.env.YT_EXTRACTOR_AUTH_1 = 'auth-token-1';
            process.env.YT_EXTRACTOR_AUTH_2 = 'auth-token-2';

            // Act
            await coreValidator.validateEnvironmentVariables();

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Validating environment variables...');
            expect(mockLoggerService.warn).toHaveBeenCalledWith(
                'YT_EXTRACTOR_AUTH token at index 0 is not valid. This is required for the YouTube extractor to work properly.'
            );
            expect(mockLoggerService.warn).toHaveBeenCalledWith(
                'YT_EXTRACTOR_AUTH token at index 1 is not valid. This is required for the YouTube extractor to work properly.'
            );
            expect(mockLoggerService.error).not.toHaveBeenCalled();
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Successfully validated environment variables.');
        });

        it('should log amount of valid YT_EXTRACTOR_AUTH tokens', async () => {
            // Arrange
            process.env.NODE_ENV = 'development';
            process.env.DISCORD_BOT_TOKEN = 'bot-token';
            process.env.DISCORD_APPLICATION_ID = '12345';
            process.env.TOTAL_SHARDS = 'AUTO';
            process.env.YT_EXTRACTOR_AUTH_1 = 'access_token=something&token_type=something';
            process.env.YT_EXTRACTOR_AUTH_2 = 'access_token=something&token_type=something';

            // Act
            await coreValidator.validateEnvironmentVariables();

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Validating environment variables...');
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Found 2 valid YT_EXTRACTOR_AUTH tokens.');
            expect(mockLoggerService.error).not.toHaveBeenCalled();
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Successfully validated environment variables.');
        });
    });

    describe('checkApplicationVersion', () => {
        it('should check application version and not warn if up to date', async () => {
            // Arrange
            mockLatestVersion = '1.0.0';
            updateTestSetup();

            // Act
            await coreValidator.checkApplicationVersion();

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Checking application version...');
            expect(mockLoggerService.debug).toHaveBeenCalledWith(`Current version is ${mockPackageJson.version}`);
            expect(mockLoggerService.warn).not.toHaveBeenCalled();
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Successfully checked application version.');
        });

        it('should return "undefined" if the latest version tag_name is null', async () => {
            // Arrange
            mockFetch = jest.fn((url) => {
                if (url === 'https://api.github.com/repos/user/repo/releases/latest') {
                    return Promise.resolve({
                        json: jest.fn().mockResolvedValue({
                            tag_name: null
                        })
                    });
                }
                return Promise.resolve({
                    json: jest.fn().mockResolvedValue({
                        message: 'Not Found',
                        documentation_url: 'https://docs.github.com/rest/releases/releases#get-the-latest-release',
                        status: '404'
                    })
                });
            }) as unknown as typeof fetch;
            updateTestSetup();

            // Act
            await coreValidator.checkApplicationVersion();

            // Assert
            expect(mockLoggerService.warn).toHaveBeenCalledWith('Failed to fetch the latest version from GitHub.');
        });

        it('should check the application version and warn if out of date', async () => {
            // Arrange
            mockLatestVersion = '2.0.0';
            mockFetch = jest.fn((url) => {
                if (url === 'https://api.github.com/repos/user/repo/releases/latest') {
                    return Promise.resolve({
                        json: jest.fn().mockResolvedValue({
                            tag_name: mockLatestVersion
                        })
                    });
                }
                return Promise.resolve({
                    json: jest.fn().mockResolvedValue({
                        message: 'Not Found',
                        documentation_url: 'https://docs.github.com/rest/releases/releases#get-the-latest-release',
                        status: '404'
                    })
                });
            }) as unknown as typeof fetch;
            updateTestSetup();

            // Act
            await coreValidator.checkApplicationVersion();

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Checking application version...');
            expect(mockLoggerService.debug).toHaveBeenCalledWith(`Current version is ${mockPackageJson.version}`);
            expect(mockLoggerService.warn).toHaveBeenCalledWith(`New version available: ${mockLatestVersion}`);
            expect(mockLoggerService.warn).toHaveBeenCalledWith(
                `You are currently using version: ${mockPackageJson.version}`
            );
            expect(mockLoggerService.warn).toHaveBeenCalledWith(
                "Please consider updating the application with 'git pull'."
            );
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Successfully checked application version.');
        });

        it('should check the application version and warn if fetch fails', async () => {
            // Arrange
            mockLatestVersion = '1.0.0';
            mockFetch = jest.fn(() => {
                return Promise.reject(new Error('Fetch failed'));
            }) as unknown as typeof fetch;
            updateTestSetup();

            // Act
            await coreValidator.checkApplicationVersion();

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Checking application version...');
            expect(mockLoggerService.debug).toHaveBeenCalledWith(`Current version is ${mockPackageJson.version}`);
            expect(mockLoggerService.warn).toHaveBeenCalledWith('Failed to fetch the latest version from GitHub.');
        });

        it('should return "undefined" if the repository URL is invalid', async () => {
            // Arrange
            mockPackageJson = {
                version: '1.0.0',
                repository: { url: 'asdf' } // Invalid URL
            };
            updateTestSetup();

            // Act
            await coreValidator.checkApplicationVersion();

            // Assert
            expect(mockLoggerService.debug).toHaveBeenCalledWith('Checking application version...');
            expect(mockLoggerService.debug).toHaveBeenCalledWith(`Current version is ${mockPackageJson.version}`);
            expect(mockLoggerService.warn).toHaveBeenCalledWith('Failed to fetch the latest version from GitHub.');
        });
    });
});
