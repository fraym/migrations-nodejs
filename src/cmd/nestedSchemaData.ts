import { TypeDefinition } from "./definition/typeDefinition";

export interface NestedSchemaData {
    schema: string;
    nestedTypes: string[];
}

export const addNestedTypesToSchema = (
    definitions: Record<string, TypeDefinition>,
    nestedTypeName: string,
    nestedTypes: string[]
): NestedSchemaData => {
    const nestedTypeDefinition = definitions[nestedTypeName];

    if (
        nestedTypes.indexOf(nestedTypeName) !== -1 ||
        (nestedTypeDefinition && nestedTypeDefinition.isBaseType)
    ) {
        return {
            schema: "",
            nestedTypes: [],
        };
    }

    let newSchema = definitions[nestedTypeName].schema;

    if (!nestedTypes.includes(nestedTypeName)) {
        nestedTypes.push(nestedTypeName);
    }

    nestedTypeDefinition.nestedTypes.forEach(nestedNestedTypeName => {
        const nestedSchemaData = addNestedTypesToSchema(
            definitions,
            nestedNestedTypeName,
            nestedTypes
        );

        if (nestedSchemaData.schema === "") {
            return;
        }

        newSchema += `\n${nestedSchemaData.schema}`;
        nestedSchemaData.nestedTypes.forEach(nestedType => {
            if (!nestedTypes.includes(nestedType)) {
                nestedTypes.push(nestedType);
            }
        });
    });

    return {
        schema: newSchema,
        nestedTypes: nestedTypes,
    };
};
