import { ClientConfig, useConfigDefaults } from "../config/config";
import { runMigration } from "./migrate";

export interface Client {
    migrate: (schema: string, namespace: string) => Promise<void>;
}

export const newClient = async (config?: ClientConfig): Promise<Client> => {
    const currentConfig = useConfigDefaults(config);

    const migrate = async (schema: string, namespace: string) => {
        await runMigration(schema, namespace, currentConfig);
    };

    return {
        migrate,
    };
};
