#!/usr/bin/env node
//@ts-nocheck
import commander from "commander";
import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import inquirer from "inquirer";
import { ALL_REGIONS, EU_CODE, isRegion } from "@storyblok/region-helper";
import updateNotifier from "update-notifier";
import fs from "fs";
import tasks from "./tasks";
import { getQuestions, lastStep, api, creds, buildFilterQuery } from "./utils";
import { SYNC_TYPES, COMMANDS } from "./constants";
export * from "./types/index";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import path from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rawPkg = fs.readFileSync(path.join(__dirname, "../package.json"));
const pkg = JSON.parse(rawPkg);
const program = new commander.Command();
const allRegionsText = ALL_REGIONS.join(", ");

clear();
console.log(chalk.cyan(figlet.textSync("storyblok")));
console.log();
console.log();
console.log("Hi, welcome to the Storyblok CLI");
console.log();

// non-intrusive notify users if an update available
const notifyOptions = {
  isGlobal: true,
};

updateNotifier({ pkg }).notify(notifyOptions);

program.version(pkg.version);

program.option("-s, --space [value]", "space ID");

// login
program
  .command(COMMANDS.LOGIN)
  .description("Login to the Storyblok cli")
  .option("-t, --token <token>", "Token to login directly without questions, like for CI environments")
  .option(
    "-r, --region <region>",
    `The region you would like to work in. Please keep in mind that the region must match the region of your space. This region flag will be used for the other cli's commands. You can use the values: ${allRegionsText}.`,
    EU_CODE
  )
  .action(async (options) => {
    const { token, region } = options;

    if (api.isAuthorized()) {
      console.log(
        chalk.green("✓") +
          " The user has been already logged. If you want to change the logged user, you must logout and login again"
      );
      return;
    }

    if (!isRegion(region)) {
      console.log(
        chalk.red("X") +
          `The provided region ${region} is not valid. Please use one of the following: ${allRegionsText}`
      );
      return;
    }

    try {
      await api.processLogin(token, region);
      process.exit(0);
    } catch (e) {
      console.log(chalk.red("X") + " An error occurred when logging the user: " + e.message);
      process.exit(1);
    }
  });

// getUser
program
  .command("user")
  .description("Get the currently logged in user")
  .action(async () => {
    if (api.isAuthorized()) {
      try {
        const user = await api.getUser();
        console.log(chalk.green("✓") + ` Hi ${user.friendly_name}, you current logged in with: ${creds.get().email}`);
      } catch (e) {
        console.log(chalk.red("X") + ` Please check if your current region matches your user's region: ${e.message}.`);
      } finally {
        process.exit(0);
      }
    }
    console.log(chalk.red("X") + " There is currently no user logged.");
  });

// logout
program
  .command(COMMANDS.LOGOUT)
  .description("Logout from the Storyblok cli")
  .action(async () => {
    try {
      await api.logout();
      console.log("Logged out successfully! Token has been removed from .netrc file.");
      process.exit(0);
    } catch (e) {
      console.log(chalk.red("X") + " An error occurred when logging out the user: " + e.message);
      process.exit(1);
    }
  });

// pull-languages
program
  .command("pull-languages")
  .description("Download your space's languages schema as json")
  .action(async () => {
    console.log(`${chalk.blue("-")} Executing pull-languages task`);
    const space = program.space;
    if (!space) {
      console.log(chalk.red("X") + " Please provide the space as argument --space YOUR_SPACE_ID.");
      process.exit(0);
    }

    try {
      if (!api.isAuthorized()) {
        await api.processLogin();
      }

      api.setSpaceId(space);
      await tasks.pullLanguages(api, { space });
    } catch (e) {
      console.log(chalk.red("X") + " An error occurred when executing the pull-languages task: " + e.message);
      process.exit(1);
    }
  });

// pull-components
program
  .command(COMMANDS.PULL_COMPONENTS)
  .option("--sf, --separate-files [value]", "Argument to create a single file for each component")
  .option("-p, --path <path>", "Path to save the component files")
  .option("-f, --file-name <fileName>", "custom name to be used in file(s) name instead of space id")
  .option("-ppn, --prefix-presets-names", "Prefixes the names of presets with the name of the components")
  .option("--rd, --resolve-datasources", "Fill options for single/multiple option field with the linked datasource")
  .description("Download your space's components schema as json")
  .action(async (options) => {
    console.log(`${chalk.blue("-")} Executing pull-components task`);
    const space = program.space;
    const { separateFiles, path, prefixPresetsNames, resolveDatasources } = options;
    if (!space) {
      console.log(chalk.red("X") + " Please provide the space as argument --space YOUR_SPACE_ID.");
      process.exit(0);
    }

    const fileName = options.fileName ? options.fileName : space;

    try {
      if (!api.isAuthorized()) {
        await api.processLogin();
      }

      api.setSpaceId(space);
      await tasks.pullComponents(api, { fileName, separateFiles, path, prefixPresetsNames, resolveDatasources });
    } catch (e) {
      errorHandler(e, COMMANDS.PULL_COMPONENTS);
    }
  });

// push-components
program
  .command(COMMANDS.PUSH_COMPONENTS + " <source>")
  .option("-p, --presets-source <presetsSource>", "Path to presets file")
  .description(
    "Download your space's components schema as json. The source parameter can be a URL to your JSON file or a path to it"
  )
  .action(async (source, options) => {
    console.log(`${chalk.blue("-")} Executing push-components task`);
    const space = program.space;
    const presetsSource = options.presetsSource;

    if (!space) {
      console.log(chalk.red("X") + " Please provide the space as argument --space YOUR_SPACE_ID.");
      process.exit(0);
    }

    try {
      if (!api.isAuthorized()) {
        await api.processLogin();
      }

      api.setSpaceId(space);
      await tasks.pushComponents(api, { source, presetsSource });
    } catch (e) {
      errorHandler(e, COMMANDS.PUSH_COMPONENTS);
    }
  });

// delete-component
program
  .command("delete-component <component>")
  .description("Delete a single component on your space.")
  .action(async (component) => {
    console.log(`${chalk.blue("-")} Executing delete-component task`);
    const space = program.space;
    if (!space) {
      console.log(chalk.red("X") + " Please provide the space as argument --space YOUR_SPACE_ID.");
      process.exit(0);
    }
    try {
      if (!api.isAuthorized()) {
        await api.processLogin();
      }

      api.setSpaceId(space);
      await tasks.deleteComponent(api, { comp: component });
    } catch (e) {
      console.log(chalk.red("X") + " An error occurred when executing the delete-component task: " + e.message);
      process.exit(1);
    }
  });

// delete-components
program
  .command("delete-components <source>")
  .description("Delete all components in your space that occur in your source file.")
  .option("-r, --reverse", "Delete all components in your space that do not appear in your source.", false)
  .option("--dryrun", "Does not perform any delete changes on your space.")
  .action(async (source, options) => {
    console.log(`${chalk.blue("-")} Executing delete-components task`);
    const space = program.space;
    if (!space) {
      console.log(chalk.red("X") + " Please provide the space as argument --space YOUR_SPACE_ID.");
      process.exit(0);
    }
    try {
      if (!api.isAuthorized()) {
        await api.processLogin();
      }

      api.setSpaceId(space);
      await tasks.deleteComponents(api, { source, dryRun: !!options.dryrun, reversed: !!options.reverse });
    } catch (e) {
      console.log(chalk.red("X") + " An error occurred when executing the delete-component task: " + e.message);
      process.exit(1);
    }
  });

// scaffold
program
  .command(COMMANDS.SCAFFOLD + " <name>")
  .description("Scaffold <name> component")
  .action(async (name) => {
    console.log(`${chalk.blue("-")} Scaffolding a component\n`);

    if (api.isAuthorized()) {
      api.accessToken = creds.get().token || null;
    }

    try {
      await tasks.scaffold(api, name, program.space);
      console.log(chalk.green("✓") + " Generated files: ");
      console.log(chalk.green("✓") + " - views/components/_" + name + ".liquid");
      console.log(chalk.green("✓") + " - source/scss/components/below/_" + name + ".scss");
      process.exit(0);
    } catch (e) {
      console.log(
        chalk.red("X") + " An error occurred when executing operations to create the component: " + e.message
      );
      process.exit(1);
    }
  });

// select
program
  .command(COMMANDS.SELECT)
  .description("Usage to kickstart a boilerplate, fieldtype or theme")
  .action(async () => {
    console.log(`${chalk.blue("-")} Select a boilerplate, fieldtype or theme to initialize\n`);

    try {
      const questions = getQuestions("select");
      const answers = await inquirer.prompt(questions);

      await lastStep(answers);
    } catch (e) {
      console.error(chalk.red("X") + " An error ocurred when execute the select command: " + e.message);
      process.exit(1);
    }
  });

// sync
program
  .command(COMMANDS.SYNC)
  .description("Sync schemas, roles, folders and stories between spaces")
  .requiredOption(
    "--type <TYPE>",
    "Define what will be sync. Can be components, folders, stories, datasources or roles"
  )
  .requiredOption("--source <SPACE_ID>", "Source space id")
  .requiredOption("--target <SPACE_ID>", "Target space id")
  .option("--starts-with <STARTS_WITH>", "Sync only stories that starts with the given string")
  .option("--filter", "Enable filter options to sync only stories that match the given filter. Required options: --keys; --operations; --values")
  .option("--keys <KEYS>", "Field names in your story object which should be used for filtering. Multiple keys should separated by comma.")
  .option("--operations <OPERATIONS>", "Operations to be used for filtering. Can be: is, in, not_in, like, not_like, any_in_array, all_in_array, gt_date, lt_date, gt_int, lt_int, gt_float, lt_float. Multiple operations should be separated by comma.")
  .option("--values <VALUES>", "Values to be used for filtering. Any string or number. If you want to use multiple values, separate them with a comma. Multiple values should be separated by comma.")
  .option("--components-groups <UUIDs>", "Synchronize components based on their group UUIDs separated by commas")
  .option("--components-full-sync", "Synchronize components by overriding any property from source to target")
  .action(async (options) => {
    console.log(`${chalk.blue("-")} Sync data between spaces\n`);

    try {
      if (!api.isAuthorized()) {
        await api.processLogin();
      }

      const {
        type,
        target,
        source,
        startsWith,
        filter,
        keys,
        operations,
        values,
        componentsGroups,
        componentsFullSync
      } = options;

      const _componentsGroups = componentsGroups ? componentsGroups.split(",") : null;
      const _componentsFullSync = !!componentsFullSync;
      const filterQuery = filter ? buildFilterQuery(keys, operations, values) : undefined;
      const token = creds.get().token || null;

      const _types = type.split(",") || [];
      _types.forEach((_type) => {
        if (!SYNC_TYPES.includes(_type)) {
          throw new Error(`The type ${_type} is not valid`);
        }
      });

      await tasks.sync(_types, {
        api,
        token,
        target,
        source,
        startsWith,
        filterQuery,
        _componentsGroups,
        _componentsFullSync,
      });

      console.log("\n" + chalk.green("✓") + " Sync data between spaces successfully completed");
    } catch (e) {
      errorHandler(e, COMMANDS.SYNC);
    }
  });

// quickstart
program
  .command(COMMANDS.QUICKSTART)
  .description("Start a project quickly")
  .action(async () => {
    try {
      if (!api.isAuthorized()) {
        await api.processLogin();
      }

      const space = program.space;
      const questions = getQuestions("quickstart", { space }, api);
      const answers = await inquirer.prompt(questions);
      await tasks.quickstart(api, answers, space);
    } catch (e) {
      console.log(chalk.red("X") + " An error ocurred when execute quickstart operations: " + e.message);
      process.exit(1);
    }
  });

program
  .command(COMMANDS.GENERATE_MIGRATION)
  .description("Generate a content migration file")
  .requiredOption("-c, --component <COMPONENT_NAME>", "Name of the component")
  .requiredOption("-f, --field <FIELD_NAME>", "Name of the component field")
  .action(async (options) => {
    const { field = "" } = options;
    const { component = "" } = options;

    const space = program.space;
    if (!space) {
      console.log(chalk.red("X") + " Please provide the space as argument --space YOUR_SPACE_ID.");
      process.exit(1);
    }

    console.log(`${chalk.blue("-")} Creating the migration file in ./migrations/change_${component}_${field}.js\n`);

    try {
      if (!api.isAuthorized()) {
        await api.processLogin();
      }

      api.setSpaceId(space);
      await tasks.generateMigration(api, component, field);
    } catch (e) {
      console.log(chalk.red("X") + " An error ocurred when generate the migration file: " + e.message);
      process.exit(1);
    }
  });

program
  .command(COMMANDS.RUN_MIGRATION)
  .description("Run a migration file")
  .requiredOption("-c, --component <COMPONENT_NAME>", "Name of the component")
  .requiredOption("-f, --field <FIELD_NAME>", "Name of the component field")
  .option("--dryrun", "Do not update the story content")
  .option("--publish <PUBLISH_OPTION>", "Publish the content. It can be: all, published or published-with-changes")
  .option("--publish-languages <LANGUAGES>", "Publish specific languages")
  .action(async (options) => {
    const field = options.field || "";
    const component = options.component || "";
    const isDryrun = !!options.dryrun;
    const publish = options.publish || null;
    const publishLanguages = options.publishLanguages || "";

    const space = program.space;
    if (!space) {
      console.log(chalk.red("X") + " Please provide the space as argument --space YOUR_SPACE_ID.");
      process.exit(1);
    }

    const publishOptionsAvailable = ["all", "published", "published-with-changes"];
    if (publish && !publishOptionsAvailable.includes(publish)) {
      console.log(
        chalk.red("X") + " Please provide a correct publish option: all, published, or published-with-changes"
      );
      process.exit(1);
    }

    console.log(`${chalk.blue("-")} Processing the migration ./migrations/change_${component}_${field}.js\n`);

    try {
      if (!api.isAuthorized()) {
        await api.processLogin();
      }

      api.setSpaceId(space);
      await tasks.runMigration(api, component, field, { isDryrun, publish, publishLanguages });
    } catch (e) {
      console.log(chalk.red("X") + " An error ocurred when run the migration file: " + e.message);
      process.exit(1);
    }
  });

program
  .command(COMMANDS.ROLLBACK_MIGRATION)
  .description("Rollback-migration a migration file")
  .requiredOption("-c, --component <COMPONENT_NAME>", "Name of the component")
  .requiredOption("-f, --field <FIELD_NAME>", "Name of the component field")
  .action(async (options) => {
    const field = options.field || "";
    const component = options.component || "";
    const space = program.space;
    if (!space) {
      console.log(chalk.red("X") + " Please provide the space as argument --space YOUR_SPACE_ID.");
      process.exit(1);
    }

    try {
      if (!api.isAuthorized()) {
        await api.processLogin();
      }

      api.setSpaceId(space);

      await tasks.rollbackMigration(api, field, component);
    } catch (e) {
      console.log(chalk.red("X") + " An error ocurred when run rollback-migration: " + e.message);
      process.exit(1);
    }
  });

// list spaces
program
  .command(COMMANDS.SPACES)
  .description("List all spaces of the logged account")
  .action(async () => {
    try {
      if (!api.isAuthorized()) {
        await api.processLogin();
      }
      const { region } = creds.get();

      await tasks.listSpaces(api, region);
    } catch (e) {
      console.log(chalk.red("X") + " An error ocurred to listing spaces: " + e.message);
      process.exit(1);
    }
  });

// import data
program
  .command(COMMANDS.IMPORT)
  .description("Import data from other systems and relational databases.")
  .requiredOption("-f, --file <FILE_NAME>", "Name of the file")
  .requiredOption("-t, --type <TYPE>", "Type of the content")
  .option("-fr, --folder <FOLDER_ID>", "(Optional) This is a Id of folder in storyblok")
  .option("-d, --delimiter <DELIMITER>", 'If you are using a csv file, put the file delimiter, the default is ";"')
  .action(async (options) => {
    const space = program.space;

    try {
      if (!api.isAuthorized()) {
        await api.processLogin();
      }

      if (!space) {
        console.log(chalk.red("X") + " Please provide the space as argument --space <SPACE_ID>.");
        return;
      }

      api.setSpaceId(space);
      await tasks.importFiles(api, options);

      console.log(`${chalk.green("✓")} The import process was executed with success!`);
    } catch (e) {
      console.log(chalk.red("X") + " An error ocurred to import data : " + e.message);
      process.exit(1);
    }
  });

// delete-datasources
program
  .command(COMMANDS.DELETE_DATASOURCES)
  .requiredOption("--space-id <SPACE_ID>", "Space id")
  .option("--by-slug <SLUG>", "Delete datasources by slug")
  .option("--by-name <name>", "Delete datasources by name")
  .action(async (options) => {
    console.log(`${chalk.blue("-")} Executing ${COMMANDS.DELETE_DATASOURCES} task`);

    const { spaceId, bySlug, byName } = options;

    try {
      if (!api.isAuthorized()) {
        await api.processLogin();
      }

      api.setSpaceId(spaceId);

      await tasks.deleteDatasources(api, { byName, bySlug });
    } catch (e) {
      errorHandler(e, COMMANDS.DELETE_DATASOURCES);
    }
  });

// Generate Typescript type definitions
program
  .command(COMMANDS.GENERATE_TYPESCRIPT_TYPEDEFS)
  // Providing backward-compatible flags with Storyblok Generate TS https://github.com/dohomi/storyblok-generate-ts
  .requiredOption(
    "--source, --sourceFilePaths <PATHS>",
    "Path(s) to the components JSON file(s) as comma separated values",
    (paths, _previous) => paths.split(",")
  )
  .option(
    "--target, --destinationFilePath <PATH>",
    "Path to the Typescript file that will be generated (default: `storyblok-component-types.d.ts`)"
  )
  .option(
    "--titlePrefix, --typeNamesPrefix <STRING>",
    "A prefix that will be prepended to all the names of the generated types"
  )
  .option(
    "--titleSuffix, --typeNamesSuffix <STRING>",
    "A suffix that will be appended to all the names of the generated types (*default*: `Storyblok`)"
  )
  .option(
    "--compilerOptions, --JSONSchemaToTSOptionsPath <PATH>",
    "Path to a JSON file with a list of options supported by json-schema-to-typescript"
  )
  .option("--customTypeParser, --customFieldTypesParserPath <PATH>", "Path to the parser file for Custom Field Types")
  .action((options) => {
    console.log(`${chalk.blue("-")} Executing ${COMMANDS.GENERATE_TYPESCRIPT_TYPEDEFS} task`);

    const {
      sourceFilePaths,
      destinationFilePath,
      typeNamesPrefix,
      typeNamesSuffix,
      customFieldTypesParserPath,
      JSONSchemaToTSOptionsPath,
    } = options;

    try {
      tasks.generateTypescriptTypedefs({
        sourceFilePaths,
        destinationFilePath,
        typeNamesPrefix,
        typeNamesSuffix,
        customFieldTypesParserPath,
        JSONSchemaToTSOptionsPath,
      });
    } catch (e) {
      errorHandler(e, COMMANDS.GENERATE_TYPESCRIPT_TYPEDEFS);
    }
  });

program.parse(process.argv);

if (program.rawArgs.length <= 2) {
  program.help();
}

function errorHandler(e, command) {
  if (/404/.test(e.message)) {
    const allRegionsButDefault = ALL_REGIONS.filter((region) => region !== EU_CODE).join(" ,");
    console.log(
      chalk.yellow("/!\\") +
        ` If your space was not created under ${EU_CODE} region, you must provide the region (${allRegionsButDefault}) upon login.`
    );
  } else {
    console.log(e)
    console.log(JSON.stringify(e, null, 2));
    console.log(chalk.red("X") + " An error occurred when executing the " + command + " task: " + e || e.message);
  }
  process.exit(1);
}
