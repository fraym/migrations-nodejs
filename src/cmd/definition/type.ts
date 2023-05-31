import { Kind, TypeNode } from "graphql";
import { ensureValidName } from "./util";

export interface TypeData {
    str: string;
    nestedType?: string;
}

export const getTypeData = (t: TypeNode, namespace: string): TypeData => {
    switch (t.kind) {
        case Kind.NAMED_TYPE:
            const name = t.name.value;
            ensureValidName(`${namespace}${name}`);

            return name === "String" ||
                name === "Float" ||
                name === "ID" ||
                name === "Boolean" ||
                name === "Int" ||
                name === "DateTime" ||
                name === "EventEnvelope" ||
                name === "File"
                ? {
                      str: name,
                  }
                : {
                      str: `${namespace}${name}`,
                      nestedType: `${namespace}${name}`,
                  };
        case Kind.LIST_TYPE:
            const { nestedType: listNestedType, str: listStr } = getTypeData(t.type, namespace);

            return {
                str: `[${listStr}]`,
                nestedType: listNestedType,
            };
        case Kind.NON_NULL_TYPE:
            const { nestedType: nonNullNestedType, str: nonNullStr } = getTypeData(
                t.type,
                namespace
            );

            return {
                str: `${nonNullStr}!`,
                nestedType: nonNullNestedType,
            };
    }
};
