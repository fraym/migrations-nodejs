import { ConstDirectiveNode } from "graphql";
import { getValueString } from "./value";

export const getDirectiveString = (d: ConstDirectiveNode): string => {
    if (!d.arguments || d.arguments.length == 0) {
        return ` @${d.name.value}`;
    }

    let argsString = "";

    d.arguments.forEach(a => {
        if (argsString !== "") {
            argsString += ", ";
        }

        argsString += `${a.name.value}: ${getValueString(a.value)}`;
    });

    return ` @${d.name.value}(${argsString})`;
};
