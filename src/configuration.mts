export type Environment = Readonly<Record<string, string | undefined>>;
export type ApplicationEnvironment = 'development' | 'production';

export interface DatabaseConfig {
    databaseUrl: string;
}

export interface StartupConfig extends DatabaseConfig {
    environment: ApplicationEnvironment;
    token: string;
    guildId: string;
    channelId: string;
    weatherApi: string | undefined;
}

export interface SetupConfig extends DatabaseConfig {
    missingDiscordSettings: readonly string[];
}

export type RegistrationConfig = {
    token: string;
    clientId: string;
} & ({ environment: 'development'; guildId: string } | { environment: 'production' });

function applicationEnvironment(env: Environment): ApplicationEnvironment {
    if (env.APP_ENV !== 'development' && env.APP_ENV !== 'production') {
        throw new Error('Set APP_ENV to development or production in .env.');
    }
    return env.APP_ENV;
}

function required(env: Environment, name: string): string {
    const value = env[name];
    if (!value?.trim()) throw new Error(`Missing .env values: ${name}`);
    return value;
}

export function readRegistrationConfig(env: Environment): RegistrationConfig {
    const environment = applicationEnvironment(env);
    const names = ['APP_TOKEN', 'APP_CLIENT_ID'];
    if (environment === 'development') names.push('APP_GUILD_ID');
    const missing = names.filter(name => !env[name]?.trim());
    if (missing.length) throw new Error(`Missing .env values: ${missing.join(', ')}`);

    const token = required(env, 'APP_TOKEN');
    const clientId = required(env, 'APP_CLIENT_ID');
    return environment === 'development'
        ? { environment, token, clientId, guildId: required(env, 'APP_GUILD_ID') }
        : { environment, token, clientId };
}

export function readStartupConfig(env: Environment): StartupConfig {
    return {
        environment: applicationEnvironment(env),
        token: required(env, 'APP_TOKEN'),
        databaseUrl: required(env, 'DATABASE_URL'),
        guildId: required(env, 'APP_GUILD_ID'),
        channelId: required(env, 'APP_CHANNEL_ID'),
        weatherApi: env.APP_WEATHER_API?.trim() || undefined,
    };
}

export function readSetupConfig(env: Environment): SetupConfig {
    return {
        databaseUrl: required(env, 'DATABASE_URL'),
        missingDiscordSettings: ['APP_TOKEN', 'APP_CLIENT_ID', 'APP_GUILD_ID', 'APP_CHANNEL_ID']
            .filter(name => !env[name]?.trim()),
    };
}
