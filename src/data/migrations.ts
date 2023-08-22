import { glob } from "glob";
import { register } from "ts-node";

export type DataMigrations = Record<number, DataMigration>;

export type DataMigration = (migrator: DataMigrator) => void;

export interface DataMigrator {}

export const runDataMigrations = async (dataMigrationsGlob: string) => {
    const files = await glob(dataMigrationsGlob);

    for (let file of files) {
        register({
            transpileOnly: true,
            compilerOptions: {
                target: "es2017",
                module: "NodeNext",
                declaration: true,
                strict: true,
                skipLibCheck: true,
                esModuleInterop: true,
                moduleResolution: "node",
                lib: ["es2017", "dom"],
            },
        });

        let migrations: DataMigrations;

        try {
            const { default: module } = await import(process.cwd() + "/" + file);
            migrations = module;
        } catch (error) {
            throw new Error(`Failed to load ${file}`);
        }

        console.log(file, migrations);

        // @todo: get executed data migrations
        // @todo: filter data migrations (only unexecuted should be applied)
        // @todo: run filtered data migrations
    }
};
