import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { CrudType, Migration, NestedType, ProjectionType } from "./data";
import { getObjectDirectives, hasDirective } from "./directive";
import { getObjectFields } from "./field";
import { ensureValidName } from "./util";
import { getEnums, getPermissions } from "./enum";

export const getMigrationFromSchema = (
    schema: GraphQLSchema,
    namespace: string,
    dangerouslyRemoveGdprFields: boolean
): Migration => {
    return {
        dangerouslyRemoveGdprFields,
        enums: getEnums(schema, namespace),
        permissions: getPermissions(schema),
        ...getTypes(schema, namespace),
    };
};

const getTypes = (
    schema: GraphQLSchema,
    namespace: string
): { crudTypes: CrudType[]; projectionTypes: ProjectionType[]; nestedTypes: NestedType[] } => {
    const usedNames: string[] = [];
    const crudTypes: CrudType[] = [];
    const projectionTypes: ProjectionType[] = [];
    const nestedTypes: NestedType[] = [];

    schema.toConfig().types.forEach(t => {
        if (!(t instanceof GraphQLObjectType) || t.toString().startsWith("__")) {
            return;
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
        } else if (hasDirective(t, "upsertOn")) {
            projectionTypes.push({
                name,
                directives: getObjectDirectives(t),
                fields: getObjectFields(t, namespace),
            });
        } else {
            nestedTypes.push({
                name,
                directives: getObjectDirectives(t),
                fields: getObjectFields(t, namespace),
            });
        }
    });

    return {
        crudTypes,
        projectionTypes,
        nestedTypes,
    };
};
