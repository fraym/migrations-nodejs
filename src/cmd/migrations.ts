#! /usr/bin/env node
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchema } from "@graphql-tools/load";
import { newClient } from "../api/client";
import { useConfig } from "./config";
import { TypeDefinition, getTypeDefinition } from "./definition/typeDefinition";
import { addNestedTypesToSchema } from "./nestedSchemaData";

const run = async () => {
    const { schemaPointers, namespace, serverAddress, apiToken } = await useConfig();

    const schema = await loadSchema(schemaPointers, {
        loaders: [new GraphQLFileLoader()],
    });

    const definitions = getTypeDefinition(schema, namespace);

    await migrateSchemas(definitions, serverAddress, apiToken, namespace);
};

const replaceWithEnvData = (str: string): string => {
    const regex = /{{env\.([a-zA-Z_]+)}}/g;
    const matches = str.match(regex);

    const envData: Record<string, string> = {};

    matches?.forEach(match => {
        const variable = match.replace("{{env.", "").replace("}}", "");

        if (!envData[variable]) {
            envData[variable] = process.env[variable] ?? "";
        }
    });

    let outputStr = str;

    Object.keys(envData).forEach(key => {
        outputStr = outputStr.replaceAll(`{{env.${key}}}`, envData[key]);
    });

    return outputStr;
};

const migrateSchemas = async (
    definitions: Record<string, TypeDefinition>,
    serverAddress: string,
    apiToken: string,
    namespace: string
) => {
    console.log(`Using Fraym migration server: ${serverAddress}\n`);

    if (namespace) {
        console.log(`Using namespace: ${namespace}\n`);
    }

    const client = await newClient({ serverAddress, apiToken });

    const baseTypesToUse: string[] = [];
    const nestedTypesToUse: string[] = [];
    let upsertSchema = "";

    Object.keys(definitions).forEach(newName => {
        if (!definitions[newName].isBaseType) {
            return;
        }

        baseTypesToUse.push(newName);
        upsertSchema += `\n${definitions[newName].schema}`;

        definitions[newName].nestedTypes.forEach(nestedTypeName => {
            const nestedSchemaData = addNestedTypesToSchema(
                definitions,
                nestedTypeName,
                nestedTypesToUse
            );

            if (nestedSchemaData.schema === "") {
                return;
            }

            upsertSchema += `\n${nestedSchemaData.schema}`;
            nestedSchemaData.nestedTypes.forEach(nestedType => {
                if (!nestedTypesToUse.includes(nestedType)) {
                    nestedTypesToUse.push(nestedType);
                }
            });
        });
    });

    upsertSchema = replaceWithEnvData(upsertSchema);

    console.log(`Migrating ${baseTypesToUse.length} types:`);
    baseTypesToUse.forEach(type => console.log(`- ${type}`));

    await client.migrate(upsertSchema, namespace);
};

run();
