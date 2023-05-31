import { ConstValueNode, Kind } from "graphql";

export const getValueString = (v: ConstValueNode): string => {
    switch (v.kind) {
        case Kind.LIST:
            let valuesString = "";

            v.values.forEach(el => {
                if (valuesString !== "") {
                    valuesString += ", ";
                }

                valuesString += getValueString(el);
            });

            return `[${valuesString}]`;
        case Kind.STRING:
            return `"${v.value}"`;
        case Kind.FLOAT:
        case Kind.INT:
        case Kind.BOOLEAN:
            return `${v.value}`;
        case Kind.NULL:
            return `null`;
        case Kind.ENUM:
            return `${v.value}`;
        case Kind.OBJECT:
            let objectString = "";

            v.fields.forEach(f => {
                if (objectString !== "") {
                    objectString += ", ";
                }

                objectString += `${f.name.value}: ${getValueString(f.value)}`;
            });

            return `{${objectString}}`;
    }
};
