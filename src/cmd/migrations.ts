import { useConfig } from "./config";
import {
    finishMigration,
    getMigrationStatus,
    registerMigration,
    rollbackMigration,
    startMigration,
} from "../api/migrate";
import { loadSchema } from "@graphql-tools/load";
import { replaceEnvPlaceholdersGraphQLFileLoader } from "./loader";
import { getMigrationFromSchema } from "../schema";
import { getLatestMigrationStatus } from "../data/migrations";

export const runGetMigrationStatus = async () => {
    console.log("get migration status ...");
    const { serverAddress, serverWsAddress, apiToken } = await useConfig();

    const status = await getMigrationStatus({ apiToken, serverAddress, serverWsAddress });
    console.log(status);
};

export const runRegisterMigration = async () => {
    console.log("registering migration ...");
    const { schemaGlob, namespace, serverAddress, serverWsAddress, apiToken } = await useConfig();

    const schema = await loadSchema(schemaGlob, {
        loaders: [replaceEnvPlaceholdersGraphQLFileLoader],
    });
    const migration = getMigrationFromSchema(schema, namespace, false);

    await registerMigration(migration, { apiToken, serverAddress, serverWsAddress });
    console.log("done registering migration");
};

export const runStartMigration = async () => {
    console.log("starting migration");
    const { serverAddress, serverWsAddress, apiToken, dataMigrationsGlob } = await useConfig();

    await startMigration({ apiToken, serverAddress, serverWsAddress, dataMigrationsGlob });
    console.log("sucessfully starting migration");
    console.log("transforming data...");
};

export const runFinishMigration = async () => {
    console.log("finishing migration ...");
    const { serverAddress, serverWsAddress, apiToken, dataMigrationsGlob } = await useConfig();

    const latestStatus = await getLatestMigrationStatus(dataMigrationsGlob);

    await finishMigration(latestStatus, { apiToken, serverAddress, serverWsAddress });
    console.log("done finishing migration");
};

export const runRollbackMigration = async () => {
    console.log("rolling back migration ...");
    const { serverAddress, serverWsAddress, apiToken } = await useConfig();

    await rollbackMigration({ apiToken, serverAddress, serverWsAddress });
    console.log("done rolling back migration");
};

export const runWait = async () => {
    console.log("waiting for migration to be ready to finish ...");
    const { serverAddress, serverWsAddress, apiToken } = await useConfig();

    let isReady = false;

    while (!isReady) {
        const status = await getMigrationStatus({ apiToken, serverAddress, serverWsAddress });

        console.log("current status: ", status);

        if (status && status.projections === "failed") {
            throw new Error("migration failed");
        }

        if (status && status.projections === "ready for finish") {
            break;
        }

        await sleep(1000);
    }

    console.log("migration is now ready to finish");
};

export const runWaitAndFinish = async () => {
    await runWait();
    await runFinishMigration();
};

const sleep = async (time: number): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
};
