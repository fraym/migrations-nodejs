import { DataMigrations } from "../../dist/data/migrations";

const migrations: DataMigrations = {
    0: migrator => {
        console.log("a", migrator);
    },
};

export default migrations;
