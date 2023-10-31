// This is heavily inspired by https://github.com/ardatan/graphql-tools/tree/master/packages/loaders/graphql-file
import { promises as fsPromises } from "fs";
const { readFile, access } = fsPromises;
import { isAbsolute, resolve } from "path";
import { env, cwd as processCwd } from "process";
import globby from "globby";
import unixify from "unixify";
import {
    asArray,
    BaseLoaderOptions,
    isValidPath,
    Loader,
    parseGraphQLSDL,
    Source,
} from "@graphql-tools/utils";

const FILE_EXTENSIONS = [".gql", ".graphql"];

const replaceWithEnvData = (str: string): string => {
    const regex = /{{env\.([a-zA-Z_]+)}}/g;
    const matches = str.match(regex);

    const envData: Record<string, string> = {};

    matches?.forEach(match => {
        const variable = match.replace("{{env.", "").replace("}}", "");

        if (!envData[variable]) {
            envData[variable] = process.env[variable] ?? "";
        }
    });

    let outputStr = str;

    Object.keys(envData).forEach(key => {
        outputStr = outputStr.replaceAll(`{{env.${key}}}`, envData[key]);
    });

    return outputStr;
};

const canLoad = async (pointer: string, options: BaseLoaderOptions): Promise<boolean> => {
    if (isValidPath(pointer)) {
        if (FILE_EXTENSIONS.find(extension => pointer.endsWith(extension))) {
            const normalizedFilePath = isAbsolute(pointer)
                ? pointer
                : resolve(options.cwd || processCwd(), pointer);
            try {
                await access(normalizedFilePath);
                return true;
            } catch {
                return false;
            }
        }
    }

    return false;
};

const buildGlobs = (glob: string, options: BaseLoaderOptions) => {
    const ignores = asArray(options.ignore || []);
    return [unixify(glob), ...ignores.map(v => `!${unixify(v)}`)];
};

const resolveGlobs = async (glob: string, options: BaseLoaderOptions) => {
    if (
        !glob.includes("*") &&
        (await canLoad(glob, options)) &&
        !asArray(options.ignore || []).length &&
        // @ts-ignore
        !options["includeSources"]
    )
        return [glob]; // bypass globby when no glob character, can be loaded, no ignores and source not requested. Fixes problem with pkg and passes ci tests
    const globs = buildGlobs(glob, options);
    const result = await globby(globs, { absolute: true, ...options, ignore: [] });
    return result;
};

export const replaceEnvPlaceholdersGraphQLFileLoader: Loader<BaseLoaderOptions> = {
    load: async (pointer: string, options: BaseLoaderOptions): Promise<Source[]> => {
        const resolvedPaths = await resolveGlobs(pointer, options);
        const finalResult: Source[] = [];
        const errors: Error[] = [];

        await Promise.all(
            resolvedPaths.map(async path => {
                if (await canLoad(path, options)) {
                    try {
                        const normalizedFilePath = isAbsolute(path)
                            ? path
                            : resolve(options.cwd || processCwd(), path);
                        const rawSDL: string = await readFile(normalizedFilePath, {
                            encoding: "utf8",
                        });

                        const replacedSDL = replaceWithEnvData(rawSDL);
                        finalResult.push(parseGraphQLSDL(pointer, replacedSDL, options));
                    } catch (e: any) {
                        if (env["DEBUG"]) {
                            console.error(e);
                        }
                        errors.push(e);
                    }
                }
            })
        );

        if (errors.length > 0) {
            if (errors.length === 1) {
                throw errors[0];
            }
            throw new AggregateError(
                errors,
                `Reading from ${pointer} failed ; \n ` +
                    errors.map((e: Error) => e.message).join("\n")
            );
        }

        return finalResult;
    },
};
