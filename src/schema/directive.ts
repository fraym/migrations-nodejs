import { ConstDirectiveNode, FieldDefinitionNode, GraphQLObjectType } from "graphql";
import { TypeArgument, TypeDirective } from "./data";
import { getArgumentValue } from "./argument";

export const hasDirective = (t: GraphQLObjectType, name: string): boolean => {
    if (!t.astNode?.directives || t.astNode?.directives.length === 0) {
        return false;
    }

    const directiveNames = t.astNode.directives.map(directive => directive.name.value);
    return directiveNames.includes(name);
};

export const getFieldDirectives = (f: FieldDefinitionNode): TypeDirective[] => {
    const directives: TypeDirective[] = [];

    f.directives?.forEach(d => {
        directives.push(getTypeDirective(d));
    });

    return directives;
};

export const getObjectDirectives = (t: GraphQLObjectType): TypeDirective[] => {
    const directives: TypeDirective[] = [];

    t.astNode?.directives?.forEach(d => {
        directives.push(getTypeDirective(d));
    });

    return directives;
};

const getTypeDirective = (d: ConstDirectiveNode): TypeDirective => {
    const typeArguments: TypeArgument[] = [];

    d.arguments?.forEach(a => {
        typeArguments.push({
            name: a.name.value,
            value: getArgumentValue(a.value),
        });
    });

    return {
        name: d.name.value,
        arguments: typeArguments,
    };
};
