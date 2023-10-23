import { DataMigrations } from "../../dist/data/migrations";

const migrations: DataMigrations = {
    crudType: "CrudTestType",
    migrations: {
        5: data => {
            console.log("CrudTestType", data);
            return data.data;
        },
    },
};

export default migrations;
