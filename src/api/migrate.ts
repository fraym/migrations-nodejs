import { ClientConfig } from "../config/config";
import { RelevantMigrations, getRelevantMigrations } from "../data/migrations";
import { Migration } from "../schema/data";
import WebSocket from "ws";

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

export const startMigration = async (
    config: ClientConfig & {
        dataMigrationsGlob: string;
    }
): Promise<void> => {
    let initialized = false;
    let relevantMigrations: RelevantMigrations = {};

    const ws = new WebSocket(`${config.serverWsAddress}/api/migration/start`, {
        perMessageDeflate: false,
        headers: {
            Authorization: `Bearer ${config.apiToken}`,
            "Content-Type": "application/json",
        },
    });

    ws.on("error", error => {
        throw error;
    });

    ws.on("close", code => {
        if (code !== 1000) {
            throw new Error(`unexpected migration end, status code: ${code}`);
        }
    });

    ws.on("message", async rawData => {
        const data = JSON.parse(rawData.toString());

        if ((!initialized && !data.status) || (initialized && data.status)) {
            ws.close();
            return;
        }

        if (data.status) {
            initialized = true;

            relevantMigrations = await getRelevantMigrations(
                config.dataMigrationsGlob,
                data.status
            );

            ws.send(JSON.stringify({ type: "init", crudTypes: Object.keys(relevantMigrations) }));
            return;
        }

        const payloadData: Record<string, any> = {};

        Object.keys(data.data).forEach(key => {
            payloadData[key] = JSON.parse(data.data[key]);
        });

        const migrations = relevantMigrations[data.crudType] ?? [];

        let latestData = payloadData;

        migrations.forEach(migration => {
            latestData = migration({
                tenantId: data.tenantId,
                id: data.id,
                data: latestData,
            });
        });

        const responseData: Record<string, string> = {};

        Object.keys(latestData).forEach(key => {
            responseData[key] = JSON.stringify(latestData[key]);
        });

        setTimeout(() => {
            ws.send(JSON.stringify(responseData));
        }, 500);
    });
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
