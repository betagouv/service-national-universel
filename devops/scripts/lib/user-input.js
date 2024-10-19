const process = require("node:process");
const path = require("node:path");

const STRING = "string";
const INTEGER = "integer";
const BOOLEAN = "boolean";

const PAD = 40;
const OPTION = "--";
const SHORTCUT = "-";

function logDefault(item) {
  if (item.default === undefined) {
    return "";
  }
  return ` (default: ${item.default})`;
}

function logOption(option) {
  let name = "";

  if (option.shortcut) {
    name += SHORTCUT + option.shortcut + ", ";
  }

  name += OPTION + option.name;
  if (option.type !== BOOLEAN) {
    name += "=...";
  }
  return name;
}

function parseBool(input) {
  if (input === "1" || input === "true") {
    return true;
  }
  if (input === "0" || input === "false") {
    return false;
  }
  return null;
}

function parseItem(type, name, value, fallback) {
  let _value = value;
  if (!_value) {
    if (fallback === undefined) {
      throw new Error(`${name} is not set`);
    } else {
      _value = String(fallback);
    }
  }
  switch (type) {
    case STRING:
    default:
      break;
    case INTEGER:
      _value = parseInt(_value);
      if (Object.is(_value, NaN)) {
        throw new Error(`${name} is not a valid integer`);
      }
      break;
    case BOOLEAN:
      _value = parseBool(_value);
      if (_value === null) {
        throw new Error(`${name} is not a valid boolean`);
      }
      break;
  }
  return _value;
}

function parseOption(arg) {
  const index = arg.indexOf("=");
  if (index === -1) {
    return {
      name: arg,
      value: "true",
    };
  } else {
    return {
      name: arg.substring(0, index),
      value: arg.substring(index + 1),
    };
  }
}

function camelize(value) {
  return value.replace(/-./g, (x) => x[1].toUpperCase());
}

const KEBAB_CASE_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const ENV_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const SHORTCUT_PATTERN = /^[a-z]{1}$/;

class UserInput {
  constructor(description) {
    this.description = description;
    this.config = {
      args: [],
      opts: [],
      envs: [],
    };
    this.optBool("help", "Print command-line options", { shortcut: "h" });
  }

  _arg(type, name, description, options) {
    if (!name.match(KEBAB_CASE_PATTERN)) {
      throw new Error(`Invalid format for ${name} : kebab-case expected`);
    }
    if (this.config.args.find((i) => i.name === name)) {
      throw new Error(`${name} already configured`);
    }
    const arg = { ...options, type, name, description };
    if (arg.default === null || arg.default === "") {
      throw new Error(`${name} has invalid default value`);
    }
    if (
      arg.default === undefined &&
      this.config.args.length &&
      this.config.args.at(-1).default !== undefined
    ) {
      throw new Error(
        "Optional arguments must be declared after required arguments"
      );
    }
    this.config.args.push(arg);
    return this;
  }

  arg(name, description, options) {
    return this._arg(STRING, name, description, options);
  }

  argInt(name, description, options) {
    return this._arg(INTEGER, name, description, options);
  }

  _opt(type, name, description, options) {
    if (!name.match(KEBAB_CASE_PATTERN)) {
      throw new Error(`Invalid format for ${name} : kebab-case expected`);
    }
    if (this.config.opts.find((i) => i.name === name)) {
      throw new Error(`${name} already configured`);
    }
    const opt = { ...options, type, name, description };
    if (opt.default === null || opt.default === "") {
      throw new Error(`${name} has invalid default value`);
    }
    if (opt.shortcut !== undefined) {
      if (!opt.shortcut.match(SHORTCUT_PATTERN)) {
        throw new Error(`Invalid shortcut for ${name}`);
      }
      if (this.config.opts.find((i) => i.shortcut === opt.shortcut)) {
        throw new Error(`shorcut ${opt.shortcut} already configured`);
      }
    }
    this.config.opts.push(opt);
    return this;
  }

  option(name, description, options) {
    return this._opt(STRING, name, description, options);
  }

  optInt(name, description, options) {
    return this._opt(INTEGER, name, description, options);
  }

  optBool(name, description, options) {
    return this._opt(BOOLEAN, name, description, options);
  }

  _env(type, name, description, options) {
    if (!name.match(ENV_PATTERN)) {
      throw new Error(`Invalid format for ${name} : identifier case expected`);
    }
    if (this.config.envs.find((i) => i.name === name)) {
      throw new Error(`${name} already configured`);
    }
    const env = { ...options, type, name, description };
    if (env.default === null || env.default === "") {
      throw new Error(`${name} has invalid default value`);
    }
    this.config.envs.push(env);
    return this;
  }

  env(name, description, options) {
    return this._env(STRING, name, description, options);
  }

  envBool(name, description, options) {
    return this._env(BOOLEAN, name, description, options);
  }

  _parseEnvironment(source, result) {
    for (const env of this.config.envs) {
      result[env.name] = parseItem(
        env.type,
        env.name,
        source[env.name],
        env.default
      );
    }
  }

  _parseOptions(source, result) {
    for (const item of source) {
      const { name, value } = parseOption(item);
      const option = this.config.opts.find((i) => OPTION + i.name === name);
      if (option) {
        result[option.name] = parseItem(
          option.type,
          name,
          value,
          option.default
        );
      } else {
        throw new Error(`Invalid option: ${name}`);
      }
    }
  }

  _parsePositionals(source, result) {
    if (source.length < this.config.args.length) {
      throw new Error("Required arguments are missing");
    }
    if (source.length > this.config.args.length) {
      throw new Error("Too much arguments were provided");
    }
    let i = 0;
    for (const arg of this.config.args) {
      const item = source[i];
      result[arg.name] = parseItem(arg.type, arg.name, item, arg.default);
      i += 1;
    }
  }

  logUsage() {
    const argNames = this.config.args
      .map((arg) => (arg.default === undefined ? arg.name : `[${arg.name}]`))
      .join(" ");
    const fileName = path.basename(process.argv[1]);
    console.log(`Usage: node ${fileName} [options] ${argNames}`);

    console.log(`\n${this.description}`);

    console.log("\nPositional arguments:");
    for (const arg of this.config.args) {
      console.log(
        `  ${arg.name.padEnd(PAD)}${arg.description}${logDefault(arg)}`
      );
    }

    console.log("\nOptions:");
    for (const option of this.config.opts) {
      console.log(
        `  ${logOption(option).padEnd(PAD)}${option.description}${logDefault(
          option
        )}`
      );
    }

    console.log("\nEnvironment variables:");
    for (const env of this.config.envs) {
      console.log(
        `  ${env.name.padEnd(PAD)}${env.description}${logDefault(env)}`
      );
    }
  }

  _parse() {
    console.log(this.config);
    const result = {};

    this._parseEnvironment(process.env, result);

    const args = process.argv.slice(2);

    const options = args.filter((arg) => arg.startsWith(OPTION));
    this._parseOptions = this._parseOptions(options, result);

    const positionals = args.filter((arg) => !arg.startsWith(OPTION));
    this._parsePositionals = this._parsePositionals(positionals, result);

    console.log(result);
    return result;
  }

  validate() {
    try {
      const result = this._parse();
      if (result["help"]) {
        this.logUsage();
        process.exit(0);
      }
      delete result["help"];
      return result;
    } catch (error) {
      console.error(error.message);
      this.logUsage();
      process.exit(1);
    }
  }
}

/*
positionals:
- positionals without default are required positionals (throw if not set)
- positionals with default are optional positionals
- optionals positionals must be declared after required positionals
- all positionals must be present in the output

envs:
- envs without default are required envs (throw if not set)
- envs with default are optional envs
- all envs must be present in the output

options:
- every options are optionals
- options set must be present in the output
- options with defatul must be present in the output
- boolean options takes no value

check existence of config (shortcut, option, env, args)
*/
module.exports = UserInput;
