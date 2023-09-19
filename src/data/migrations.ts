import { glob } from "glob";
import { register } from "ts-node";

export interface DataMigrations {
    crudType: string;
    migrations: Record<number, DataMigration>;
}

export interface MigrationData {
    tenantId: string;
    id: string;
    data: Record<string, any>;
}

export type DataMigration = (data: MigrationData) => Record<string, any>;

export interface DataMigrator {}

const getAllMigrations = async (dataMigrationsGlob: string): Promise<DataMigrations[]> => {
    const files = await glob(dataMigrationsGlob);
    const allMigrations: DataMigrations[] = [];

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

    for (let file of files) {
        let migrations: DataMigrations;

        try {
            const { default: module } = await import(process.cwd() + "/" + file);
            migrations = module;
        } catch (error) {
            throw new Error(`Failed to load ${file}`);
        }

        allMigrations.push(migrations);
    }

    return allMigrations;
};

type MigrationStatus = Record<string, number>;
export type RelevantMigrations = Record<string, DataMigration[]>;

export const getRelevantMigrations = async (
    dataMigrationsGlob: string,
    status: MigrationStatus
): Promise<RelevantMigrations> => {
    const allMigrations = await getAllMigrations(dataMigrationsGlob);
    const filteredMigrations: Record<string, DataMigration[]> = {};

    for (let migration of allMigrations) {
        const lastMigrationIndex = status[migration.crudType] ?? -1;
        const migrationList: DataMigration[] = [];

        Object.keys(migration.migrations).forEach(migrationIndexString => {
            const migrationIndex = parseInt(migrationIndexString);

            if (migrationIndex > lastMigrationIndex) {
                migrationList.push(migration.migrations[migrationIndex]);
            }
        });

        filteredMigrations[migration.crudType] = migrationList;
    }

    return filteredMigrations;
};
