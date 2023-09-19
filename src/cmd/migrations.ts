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
    console.log("done starting migration");

    // @todo: how to apply data transformations
    // 1. use new schema for temp table
    // 2. (crud) take the unmigrated data state and apply transformations for every single data instance (on changes after transformation: queue that dataid for additional transformation at the end)
    //
    // wait cmd:
    // while waiting listen for new data and transform it if needed
    // echo current progress (x of y crud / projectuon types are migrated / unchanged)

    // data transformation:
    // trigger transformation event
    // if data is changed again: trigger new transformation event
    // on rollback: trigger undo events (saved when creating the transformation events, deleted after successful migration)
};

export const runFinishMigration = async () => {
    console.log("finishing migration ...");
    const { serverAddress, serverWsAddress, apiToken } = await useConfig();

    // @todo: wait for crud and projections to be ready by using periodical checks
    // data transformations in meantime

    // await getMigrationState({ apiToken, serverAddress })

    await finishMigration({ apiToken, serverAddress, serverWsAddress });
    console.log("done finishing migration");
};

export const runRollbackMigration = async () => {
    console.log("rolling back migration ...");
    const { serverAddress, serverWsAddress, apiToken } = await useConfig();

    // @todo: wait for crud and projections to be ready by using periodical checks

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

        if (status && status.projections === "ready for finish") {
            break;
        }

        await sleep(1000);
    }

    console.log("migration is now ready to finish");
};

const sleep = async (time: number): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, time);
    });
};
