import { GraphQLEnumType, GraphQLObjectType, GraphQLSchema } from "graphql";
import { ensureValidName } from "./util";
import { getTypeDefinitionFromGraphQLEnumType } from "./enum";
import { getTypeDefinitionFromGraphQLObjectType } from "./object";

export interface TypeDefinition {
    isBaseType: boolean;
    schema: string;
    nestedTypes: string[];
}

export const getTypeDefinition = (
    schema: GraphQLSchema,
    namespace: string
): Record<string, TypeDefinition> => {
    const definitions: Record<string, TypeDefinition> = {};

    schema.toConfig().types.forEach(t => {
        if (!(t instanceof GraphQLObjectType) && !(t instanceof GraphQLEnumType)) {
            return;
        }

        const name = `${namespace}${t.toString()}`;
        ensureValidName(name);

        if (definitions[name]) {
            throw new Error(
                `duplicate definition for type "${name}" detected, try renaming one of them as they have to be uniquely named`
            );
        }

        if (t instanceof GraphQLObjectType) {
            definitions[name] = getTypeDefinitionFromGraphQLObjectType(t, namespace);
            return;
        }

        if (t instanceof GraphQLEnumType) {
            definitions[name] = getTypeDefinitionFromGraphQLEnumType(t, namespace);
            return;
        }
    });

    return definitions;
};
