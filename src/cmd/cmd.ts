#! /usr/bin/env node
import {
    runApplyMigration,
    runCleanupMigration,
    runGetMigrationStatus,
    runRegisterMigration,
    runRollbackMigration,
    runWait,
    runWaitAndApply,
} from "./migrations";

const COMMAND_STATUS = "status";
const COMMAND_REGISTER = "register";
const COMMAND_APPLY = "apply";
const COMMAND_CLEANUP = "cleanup";
const COMMAND_ROLLBACK = "rollback";
const COMMAND_WAIT = "wait";
const COMMAND_WAIT_AND_FINISH = "wait-finish";

const arg = process.argv[2] ?? COMMAND_REGISTER;

switch (arg) {
    case COMMAND_STATUS:
        runGetMigrationStatus();
        break;
    case COMMAND_REGISTER:
        runRegisterMigration();
        break;
    case COMMAND_APPLY:
        runApplyMigration();
        break;
    case COMMAND_ROLLBACK:
        runRollbackMigration();
        break;
    case COMMAND_WAIT:
        runWait();
        break;
    case COMMAND_WAIT_AND_FINISH:
        runWaitAndApply();
        break;
    case COMMAND_CLEANUP:
        runCleanupMigration();
        break;
}
