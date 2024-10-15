import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { CrudType, Migration, NestedType, ProjectionType, View } from "./data";
import { getObjectDirectives, hasDirective } from "./directive";
import { getObjectFields } from "./field";
import { ensureValidName } from "./util";
import { getEnums, getPermissions } from "./enum";
import { promises as fsPromises } from "fs";

export const getMigrationFromSchema = async (
    schema: GraphQLSchema,
    namespace: string,
    dangerouslyRemoveGdprFields: boolean
): Promise<Migration> => {
    return {
        dangerouslyRemoveGdprFields,
        enums: getEnums(schema, namespace),
        permissions: getPermissions(schema),
        ...(await getTypes(schema, namespace)),
    };
};

const getTypes = async (
    schema: GraphQLSchema,
    namespace: string
): Promise<{
    crudTypes: CrudType[];
    projectionTypes: ProjectionType[];
    nestedTypes: NestedType[];
    views: View[];
}> => {
    const usedNames: string[] = [];
    const crudTypes: CrudType[] = [];
    const projectionTypes: ProjectionType[] = [];
    const nestedTypes: NestedType[] = [];
    const views: View[] = [];

    for (const t of schema.toConfig().types) {
        if (!(t instanceof GraphQLObjectType) || t.toString().startsWith("__")) {
            continue;
        }

        const name = `${namespace}${t.toString()}`;
        ensureValidName(name);

        if (usedNames.includes(name)) {
            throw new Error(
                `duplicate definition for type "${name}" detected, try renaming one of them as they have to be uniquely named`
            );
        }

        usedNames.push(name);

        if (hasDirective(t, "crudType")) {
            crudTypes.push({
                name,
                directives: getObjectDirectives(t),
                fields: getObjectFields(t, namespace),
            });
        } else if (hasDirective(t, "upsertOn") || hasDirective(t, "dangerouslyUpsertOn")) {
            projectionTypes.push({
                name,
                directives: getObjectDirectives(t),
                fields: getObjectFields(t, namespace),
            });
        } else if (hasDirective(t, "view")) {
            const directives = getObjectDirectives(t);
            const viewDirective = directives.find(d => d.name === "view");
            const sqlFileArg = viewDirective?.arguments.find(a => a.name === "sqlFile");
            const sqlFileName = sqlFileArg?.value;

            if (!sqlFileName || typeof sqlFileName !== "string") {
                throw new Error(`view directive on type "${name}" requires a sqlFile argument`);
            }

            const sql = await fsPromises.readFile(sqlFileName, {
                encoding: "utf8",
            });

            views.push({
                name,
                sql,
                directives,
                fields: getObjectFields(t, namespace),
            });
        } else {
            nestedTypes.push({
                name,
                directives: getObjectDirectives(t),
                fields: getObjectFields(t, namespace),
            });
        }
    }

    return {
        crudTypes,
        projectionTypes,
        nestedTypes,
        views,
    };
};
