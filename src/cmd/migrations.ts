import { useConfig } from "./config";
import {
    applyMigration,
    cleanupMigration,
    getMigrationStatus,
    registerMigration,
    rollbackMigration,
} from "../api/migrate";
import { loadSchema } from "@graphql-tools/load";
import { replaceEnvPlaceholdersGraphQLFileLoader } from "./loader";
import { getMigrationFromSchema } from "../schema";
import { getLatestMigrationStatus } from "../data/migrations";

export const runGetMigrationStatus = async () => {
    console.log("get migration status ...");
    const { serverAddress, serverWsAddress, apiToken, namespace } = await useConfig();

    const status = await getMigrationStatus({
        apiToken,
        serverAddress,
        serverWsAddress,
        namespace,
    });
    console.log(status);
};

export const runRegisterMigration = async () => {
    console.log("registering migration ...");
    const { schemaGlob, namespace, serverAddress, serverWsAddress, apiToken } = await useConfig();

    const schema = await loadSchema(schemaGlob, {
        loaders: [replaceEnvPlaceholdersGraphQLFileLoader],
    });
    const migration = getMigrationFromSchema(schema, namespace, false);

    await registerMigration(migration, { apiToken, serverAddress, serverWsAddress, namespace });
    console.log("done registering migration");
};

export const runApplyMigration = async () => {
    console.log("apply migration ...");
    const { serverAddress, serverWsAddress, apiToken, namespace } = await useConfig();

    await applyMigration({ apiToken, serverAddress, serverWsAddress, namespace });
    console.log("done apply migration");
};

export const runCleanupMigration = async () => {
    console.log("cleanup migration ...");
    const { serverAddress, serverWsAddress, apiToken, dataMigrationsGlob, namespace } =
        await useConfig();

    const latestMigrationStatus = await getLatestMigrationStatus(dataMigrationsGlob);

    await cleanupMigration(latestMigrationStatus, {
        apiToken,
        serverAddress,
        serverWsAddress,
        namespace,
    });
    console.log("done cleanup migration");
};

export const runRollbackMigration = async () => {
    console.log("rolling back migration ...");
    const { serverAddress, serverWsAddress, apiToken, namespace } = await useConfig();

    await rollbackMigration({ apiToken, serverAddress, serverWsAddress, namespace });
    console.log("done rolling back migration");
};

export const runWait = async () => {
    console.log("waiting for migration to be ready to finish ...");
    const { serverAddress, serverWsAddress, apiToken, namespace } = await useConfig();

    let isReady = false;

    while (!isReady) {
        const status = await getMigrationStatus({
            apiToken,
            serverAddress,
            serverWsAddress,
            namespace,
        });

        console.log("current status: ", status);

        if (status && status.projections === "failed") {
            throw new Error("migration failed");
        }

        if (
            status &&
            (status.projections === "ready for finish" || status.projections === "done")
        ) {
            break;
        }

        await sleep(1000);
    }

    console.log("migration is now ready to finish");
};

export const runWaitAndApply = async () => {
    await runWait();
    await runApplyMigration();
};

const sleep = async (time: number): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
};
