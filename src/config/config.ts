import { config } from "dotenv";

export interface ClientConfig {
    // serverAddress: address of the projection service
    serverAddress: string;
    // serverAddress: address of the projection service
    serverWsAddress: string;
    // apiToken: auth token for the api
    apiToken: string;
}

export const getEnvConfig = (): ClientConfig => {
    config();

    const secure =
        process.env.MIGRATIONS_SECURE === "1" ||
        process.env.MIGRATIONS_SECURE?.toLowerCase() === "true";

    const httpProtocoll = secure ? "https" : "http";
    const wsProtocoll = secure ? "wss" : "ws";

    return {
        serverAddress: process.env.MIGRATIONS_SERVER_ADDRESS
            ? `${httpProtocoll}${process.env.MIGRATIONS_SERVER_ADDRESS}`
            : "",
        serverWsAddress: process.env.MIGRATIONS_SERVER_ADDRESS
            ? `${wsProtocoll}${process.env.MIGRATIONS_SERVER_ADDRESS}`
            : "",
        apiToken: process.env.MIGRATIONS_API_TOKEN ?? "",
    };
};

export const useConfigDefaults = (config?: ClientConfig): Required<ClientConfig> => {
    if (!config) {
        config = getEnvConfig();
    }

    return {
        serverAddress: config.serverAddress,
        serverWsAddress: config.serverWsAddress,
        apiToken: config.apiToken,
    };
};
