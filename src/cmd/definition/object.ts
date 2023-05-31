import { GraphQLObjectType } from "graphql";
import { TypeDefinition } from "./typeDefinition";
import { ensureValidName } from "./util";
import { getDirectiveString } from "./directive";
import { getFieldStringAndNestedTypes } from "./fields";

export const getTypeDefinitionFromGraphQLObjectType = (
    t: GraphQLObjectType,
    namespace: string
): TypeDefinition => {
    let isBaseType = false;

    if (t.astNode?.directives && t.astNode?.directives.length > 0) {
        const directiveNames = t.astNode.directives.map(directive => directive.name.value);
        isBaseType = directiveNames.includes("upsertOn") || directiveNames.includes("crudType");
    }

    const name = `${namespace}${t.toString()}`;
    ensureValidName(name);

    let objectDirectivesString = "";
    let objectFieldsString = "";
    let nestedTypes: string[] = [];

    t.astNode?.directives?.forEach(d => {
        objectDirectivesString += getDirectiveString(d);
    });

    t.astNode?.fields?.forEach(f => {
        const { str, nestedTypes: newNestedTypes } = getFieldStringAndNestedTypes(f, namespace);
        objectFieldsString += str;

        newNestedTypes.forEach(nested => {
            if (nestedTypes.indexOf(nested) === -1) {
                nestedTypes.push(nested);
            }
        });
    });

    const schema = `type ${name}${objectDirectivesString} {${objectFieldsString}\n}`;

    return {
        isBaseType,
        nestedTypes,
        schema,
    };
};
