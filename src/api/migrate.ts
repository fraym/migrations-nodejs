import { ClientConfig } from "../config/config";
import { Migration } from "../schema/data";

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

export interface MigrationStatus {
    auth: string;
    crud: string;
    projections: string;
}

export const getMigrationStatus = async (config: ClientConfig): Promise<MigrationStatus> => {
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

export const finishMigration = async (
    status: Record<string, number>,
    config: ClientConfig
): Promise<void> => {
    const response = await fetch(`${config.serverAddress}/api/migration/finish`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
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
