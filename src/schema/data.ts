export interface Migration {
    dangerouslyRemoveGdprFields: boolean;
    permissions: string[];
    crudTypes: CrudType[];
    projectionTypes: ProjectionType[];
    enums: EnumType[];
    nestedTypes: NestedType[];
    views: View[];
}

export interface View {
    name: string;
    sql: string;
    directives: TypeDirective[];
    fields: TypeField[];
}

export interface CrudType {
    name: string;
    directives: TypeDirective[];
    fields: TypeField[];
}

export interface ProjectionType {
    name: string;
    directives: TypeDirective[];
    fields: TypeField[];
}

export interface NestedType {
    name: string;
    directives: TypeDirective[];
    fields: TypeField[];
}

export interface EnumType {
    name: string;
    values: string[];
}

export interface TypeField {
    name: string;
    type: string[];
    directives: TypeDirective[];
}

export interface TypeDirective {
    name: string;
    arguments: TypeArgument[];
}

export interface TypeArgument {
    name: string;
    value: any;
}
