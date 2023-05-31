import { GraphQLEnumType } from "graphql";
import { ensureValidName } from "./util";
import { TypeDefinition } from "./typeDefinition";

export const getTypeDefinitionFromGraphQLEnumType = (
    t: GraphQLEnumType,
    namespace: string
): TypeDefinition => {
    const originalName = t.toString();
    const name = originalName !== "Permission" ? `${namespace}${originalName}` : originalName;
    ensureValidName(name);

    let enumValuesString = "";

    t.astNode?.values?.forEach(value => {
        enumValuesString += `\n\t${value.name.value}`;
    });

    const schema = `enum ${name} {${enumValuesString}\n}`;

    return {
        isBaseType: name === "Permission",
        nestedTypes: [],
        schema,
    };
};
