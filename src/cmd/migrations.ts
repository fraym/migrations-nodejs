#! /usr/bin/env node
import { loadSchema } from "@graphql-tools/load";
import { useConfig } from "./config";
import { getMigrationFromSchema } from "../schema";
import { replaceEnvPlaceholdersGraphQLFileLoader } from "./loader";

const run = async () => {
    const { schemaGlob, namespace /* dataMigrationsGlob, serverAddress, apiToken*/ } =
        await useConfig();

    const schema = await loadSchema(schemaGlob, {
        loaders: [replaceEnvPlaceholdersGraphQLFileLoader],
    });
    const migration = getMigrationFromSchema(schema, namespace, false);

    // @todo: what if something fails: rollback
    // @todo: how to apply data transformations

    // 1. use new schema for temp table
    // 2. (crud) while migrating apply data transformation for every new state

    // wait cmd:
    // while waiting listen for new data and transform it if needed
    // echo current progress (x of y crud / projectuon types are migrated / unchanged)

    // finish cmd:
    // transform rest of untransformed data, then switch new projecton live

    // data transformation:
    // trigger transformation event
    // if data is changed again: trigger new transformation event
    // on rollback: trigger undo events (saved when creating the transformation events, deleted after successful migration)

    console.log(JSON.stringify(migration));
};

run();
