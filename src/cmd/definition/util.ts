export const ensureValidName = (name: string): void | never => {
    if (name.startsWith("Fraym")) {
        throw new Error(
            `Cannot use Fraym as type, enum and scalar prefix as it is reserved for fraym apps, got ${name}`
        );
    }
};
