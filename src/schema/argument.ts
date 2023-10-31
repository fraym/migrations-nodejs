import { ConstValueNode, Kind } from "graphql";

export const getArgumentValue = (v: ConstValueNode): any => {
    switch (v.kind) {
        case Kind.LIST:
            const listValue: any[] = [];

            v.values.forEach(el => {
                listValue.push(getArgumentValue(el));
            });

            return listValue;
        case Kind.STRING:
            return v.value;
        case Kind.FLOAT:
            return parseFloat(v.value);
        case Kind.INT:
            return parseInt(v.value);
        case Kind.BOOLEAN:
            return v.value;
        case Kind.NULL:
            return null;
        case Kind.ENUM:
            return v.value;
        case Kind.OBJECT:
            const objectValue: Record<string, any> = {};

            v.fields.forEach(f => {
                objectValue[f.name.value] = getArgumentValue(f.value);
            });

            return objectValue;
    }
};
