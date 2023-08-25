#! /usr/bin/env node
import {
    runFinishMigration,
    runRegisterMigration,
    runRollbackMigration,
    runStartMigration,
} from "./migrations";

const COMMAND_REGISTER = "register";
const COMMAND_START = "start";
const COMMAND_FINISH = "finish";
const COMMAND_ROLLBACK = "rollback";

const arg = process.argv[2] ?? COMMAND_REGISTER;

switch (arg) {
    case COMMAND_REGISTER:
        runRegisterMigration();
        break;
    case COMMAND_START:
        runStartMigration();
        break;
    case COMMAND_FINISH:
        runFinishMigration();
        break;
    case COMMAND_ROLLBACK:
        runRollbackMigration();
        break;
}
