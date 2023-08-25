import { ClientConfig } from "config/config";
import { Migration } from "schema/data";

export const registerMigration = async (
    migration: Migration,
    config: ClientConfig
): Promise<void> => {
    const response = await fetch(`${config.serverAddress}/api/migration/register`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(migration),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
};

export interface MigrationState {
    auth: string;
    crud: string;
    projections: string;
}

export const getMigrationState = async (config: ClientConfig): Promise<MigrationState> => {
    const response = await fetch(`${config.serverAddress}/api/migration/status`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return await response.json();
};

export const finishMigration = async (config: ClientConfig): Promise<void> => {
    const response = await fetch(`${config.serverAddress}/api/migration/finish`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
};

export const rollbackMigration = async (config: ClientConfig): Promise<void> => {
    const response = await fetch(`${config.serverAddress}/api/migration/rollback`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
};
