import { useConfig } from "./config";
import { finishMigration, registerMigration, rollbackMigration } from "../api/migrate";
import { loadSchema } from "@graphql-tools/load";
import { replaceEnvPlaceholdersGraphQLFileLoader } from "./loader";
import { getMigrationFromSchema } from "../schema";

export const runRegisterMigration = async () => {
    console.log("registering migration ...");
    const { schemaGlob, namespace, serverAddress, apiToken } = await useConfig();

    const schema = await loadSchema(schemaGlob, {
        loaders: [replaceEnvPlaceholdersGraphQLFileLoader],
    });
    const migration = getMigrationFromSchema(schema, namespace, false);

    await registerMigration(migration, { apiToken, serverAddress });
    console.log("done registering migration");
};

export const runStartMigration = async () => {
    console.log("starting migration");

    // @todo: start projections in crud and projections
    // data transformations in meantime
    //
    // @todo: what if something fails: rollback
    // @todo: how to apply data transformations
    // 1. use new schema for temp table
    // 2. (crud) while migrating apply data transformation for every new state
    //
    // wait cmd:
    // while waiting listen for new data and transform it if needed
    // echo current progress (x of y crud / projectuon types are migrated / unchanged)
    //
    // finish cmd:
    // transform rest of untransformed data, then switch new projecton live
    //
    // data transformation:
    // trigger transformation event
    // if data is changed again: trigger new transformation event
    // on rollback: trigger undo events (saved when creating the transformation events, deleted after successful migration)
};

export const runFinishMigration = async () => {
    console.log("finishing migration ...");
    const { serverAddress, apiToken } = await useConfig();

    // @todo: wait for crud and projections to be ready by using periodical checks
    // data transformations in meantime

    // await getMigrationState({ apiToken, serverAddress })

    await finishMigration({ apiToken, serverAddress });
    console.log("done finishing migration");
};

export const runRollbackMigration = async () => {
    console.log("rolling back migration ...");
    const { serverAddress, apiToken } = await useConfig();

    // @todo: wait for crud and projections to be ready by using periodical checks

    await rollbackMigration({ apiToken, serverAddress });
    console.log("done rolling back migration");
};
