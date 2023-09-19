import { DataMigrations } from "../../dist/data/migrations";

const migrations: DataMigrations = {
    crudType: "a",
    migrations: {
        124: data => {
            console.log("a", data);
            return { asd: 123 };
        },
    },
};

export default migrations;
