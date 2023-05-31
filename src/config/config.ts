import { config } from "dotenv";

export interface ClientConfig {
    // serverAddress: address of the projection service
    serverAddress: string;
    // apiToken: auth token for the api
    apiToken: string;
}

export const getEnvConfig = (): ClientConfig => {
    config();

    return {
        serverAddress: process.env.MIGRATIONS_SERVER_ADDRESS ?? "",
        apiToken: process.env.MIGRATIONS_API_TOKEN ?? "",
    };
};

export const useConfigDefaults = (config?: ClientConfig): Required<ClientConfig> => {
    if (!config) {
        config = getEnvConfig();
    }

    return {
        serverAddress: config.serverAddress,
        apiToken: config.apiToken,
    };
};
