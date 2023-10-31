import { GraphQLEnumType, GraphQLSchema } from "graphql";
import { EnumType } from "./data";
import { ensureValidName } from "./util";

export const getPermissions = (schema: GraphQLSchema): string[] => {
    const permissions: string[] = [];

    schema.toConfig().types.forEach(t => {
        if (!(t instanceof GraphQLEnumType)) {
            return;
        }

        const name = t.toString();
        ensureValidName(name);

        if (name !== "Permission") {
            return;
        }

        t.astNode?.values?.forEach(value => {
            permissions.push(value.name.value);
        });
    });

    return permissions;
};

export const getEnums = (schema: GraphQLSchema, namespace: string): EnumType[] => {
    const enums: EnumType[] = [];

    schema.toConfig().types.forEach(t => {
        if (!(t instanceof GraphQLEnumType)) {
            return;
        }

        const name = t.toString();
        ensureValidName(name);

        if (name === "Permission" || name.startsWith("__")) {
            return;
        }

        const values: string[] = [];

        t.astNode?.values?.forEach(value => {
            values.push(value.name.value);
        });

        enums.push({
            name: `${namespace}${name}`,
            values,
        });
    });

    return enums;
};
