import { FieldDefinitionNode } from "graphql";
import { getDirectiveString } from "./directive";
import { getTypeData } from "./type";

export interface FieldData {
    str: string;
    nestedTypes: string[];
}

export const getFieldStringAndNestedTypes = (
    f: FieldDefinitionNode,
    namespace: string
): FieldData => {
    let directivesString = "";

    f.directives?.forEach(d => {
        directivesString += getDirectiveString(d);
    });

    const { nestedType, str: typeString } = getTypeData(f.type, namespace);

    const nestedTypes: string[] = [];

    if (nestedType) {
        nestedTypes.push(nestedType);
    }

    return {
        str: `\n\t${f.name.value}: ${typeString}${directivesString}`,
        nestedTypes,
    };
};
