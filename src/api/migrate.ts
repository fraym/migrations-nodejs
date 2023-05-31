import { ClientConfig } from "config/config";

export const runMigration = async (
    upsertSchema: string,
    namespace: string,
    config: ClientConfig
): Promise<void> => {
    const response = await fetch(`${config.serverAddress}/api/migration/start`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            upsertSchema,
            namespace,
        }),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
};
