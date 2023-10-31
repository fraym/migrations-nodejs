import { DataMigrations } from "../../dist/data/migrations";

const migrations: DataMigrations = {
    crudType: "CrudTestType",
    migrations: {
        0: data => {
            console.log("CrudTestType:", data);
            return data.data;
        },
        1: data => {
            console.log("CrudTestType 2:", data);
            return data.data;
        },
    },
};

export default migrations;
