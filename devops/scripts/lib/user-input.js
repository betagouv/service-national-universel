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

function validateName(name, pattern) {
  if (!name.match(pattern)) {
    throw new Error(`Invalid format for ${name}`);
  }
}

function validateDefault(item) {
  if (item.default === null || item.default === "") {
    throw new Error(`${item.name} has invalid default value`);
  }
}

function validateShortcut(item) {
  if (!item.shortcut.match(SHORTCUT_PATTERN)) {
    throw new Error(`Invalid shortcut for ${item.name}`);
  }
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

function parseValue(type, name, value) {
  let _value = value;
  if (!_value) {
    throw new Error(`${name} value is not set`);
  }
  switch (type) {
    case STRING:
    default:
      break;
    case INTEGER:
      _value = parseInt(_value);
      if (Object.is(_value, NaN)) {
        throw new Error(`${name} value is not a valid integer`);
      }
      break;
    case BOOLEAN:
      _value = parseBool(_value);
      if (_value === null) {
        throw new Error(`${name} value is not a valid boolean`);
      }
      break;
  }
  return _value;
}

function parseOption(arg) {
  const index = arg.indexOf("=");
  if (index === -1) {
    return {
      name: arg.substring(OPTION.length),
    };
  } else {
    return {
      name: arg.substring(OPTION.length, index),
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
      multiple: null,
    };
    this.optBool("help", "Print command-line options", { shortcut: "h" });
  }

  validateNameUnique(name) {
    if (this.config.multiple && name === this.config.multiple.name) {
      throw new Error(`${name} already configured`);
    }
    for (const array of [
      this.config.args,
      this.config.opts,
      this.config.envs,
    ]) {
      if (array.find((i) => i.name === name)) {
        throw new Error(`${name} already configured`);
      }
    }
  }

  validateShortcutUnique(shortcut) {
    if (this.config.opts.find((i) => i.shortcut === shortcut)) {
      throw new Error(`shorcut ${shortcut} already configured`);
    }
  }

  validateArgsSequence(arg) {
    if (
      arg.default === undefined &&
      this.config.args.length &&
      this.config.args.at(-1).default !== undefined
    ) {
      throw new Error(
        "Optional arguments must be declared after required arguments"
      );
    }
  }

  validateMultiple() {
    if (this.config.multiple) {
      throw new Error("Only one multiple argument must be provided");
    }
  }

  multiple(name, description) {
    this.validateMultiple();
    validateName(name, KEBAB_CASE_PATTERN);
    this.validateNameUnique(name);
    const arg = { type: STRING, name, description };
    this.config.multiple = arg;
    return this;
  }

  _arg(type, name, description, options) {
    validateName(name, KEBAB_CASE_PATTERN);
    this.validateNameUnique(name);

    const arg = { ...options, type, name, description };
    validateDefault(arg);
    this.validateArgsSequence(arg);
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
    validateName(name, KEBAB_CASE_PATTERN);
    this.validateNameUnique(name);
    const opt = { ...options, type, name, description };
    validateDefault(opt);
    if (opt.shortcut !== undefined) {
      validateShortcut(opt);
      this.validateShortcutUnique(opt.shortcut);
    }
    this.config.opts.push(opt);
    return this;
  }

  opt(name, description, options) {
    return this._opt(STRING, name, description, options);
  }

  optInt(name, description, options) {
    return this._opt(INTEGER, name, description, options);
  }

  optBool(name, description, options) {
    return this._opt(BOOLEAN, name, description, options);
  }

  _env(type, name, description, options) {
    validateName(name, ENV_PATTERN);
    this.validateNameUnique(name);
    const env = { ...options, type, name, description };
    validateDefault(env);
    this.config.envs.push(env);
    return this;
  }

  env(name, description, options) {
    return this._env(STRING, name, description, options);
  }

  envBool(name, description, options) {
    return this._env(BOOLEAN, name, description, options);
  }

  _rewriteArgs(source) {
    const args = [];
    for (const arg of source) {
      if (arg.startsWith(SHORTCUT) && !arg.startsWith(OPTION)) {
        for (const char of arg.slice(1)) {
          args.push(SHORTCUT + char);
        }
      } else {
        args.push(arg);
      }
    }
    return args;
  }

  _parseOption(result, token) {
    const option = parseOption(token);
    const display = OPTION + option.name;
    if (option.name in result) {
      throw new Error(`Option ${display} has already been set`);
    }
    const config = this.config.opts.find((i) => i.name === option.name);
    if (!config) {
      throw new Error(`Unknown option ${display}`);
    }
    if (option.value === undefined) {
      if (config.type === BOOLEAN) {
        option.value = "true";
      } else {
        throw new Error(`Option ${display} requires a value`);
      }
    }
    option.value = parseValue(config.type, display, option.value);
    return option;
  }

  _parseShortcut(args, result, token) {
    const shortcut = token.substring(SHORTCUT.length);
    const config = this.config.opts.find((i) => i.shortcut === shortcut);
    if (!config) {
      throw new Error(`Unknown option ${token}`);
    }
    const display = `${token} (${OPTION}${config.name})`;
    if (config.name in result) {
      throw new Error(`Option ${display} has already been set`);
    }
    if (config.type === BOOLEAN) {
      return { name: config.name, value: true };
    }
    const value = args.shift();
    if (value === undefined || value.startsWith(SHORTCUT)) {
      throw new Error(`Option ${display} requires a value`);
    }
    return {
      name: config.name,
      value: parseValue(config.type, display, value),
    };
  }

  _parsePositional(index, token) {
    let config = this.config.args[index];
    if (!config) {
      if (this.config.multiple) {
        config = this.config.multiple;
      } else {
        throw new Error(`Too much arguments`);
      }
    }
    return {
      name: config.name,
      value: parseValue(config.type, config.name, token),
    };
  }

  _parseArgs(args) {
    const result = {};

    const multiple = this.config.multiple;
    if (multiple) {
      result[multiple.name] = [];
    }

    let index = 0;
    while (args.length) {
      const token = args.shift();
      let item;
      if (token.startsWith(OPTION)) {
        item = this._parseOption(result, token);
      } else if (token.startsWith(SHORTCUT)) {
        item = this._parseShortcut(args, result, token);
      } else {
        item = this._parsePositional(index, token);
        index += 1;
      }
      if (multiple && multiple.name === item.name) {
        result[item.name].push(item.value);
      } else {
        result[item.name] = item.value;
      }
    }

    if (multiple && !result[multiple.name].length) {
      throw new Error("Missing required parameters");
    }

    return result;
  }

  _camelize(source) {
    const result = {};
    for (const key in source) {
      result[camelize(key)] = source[key];
    }
    return result;
  }

  _handleArgs() {
    const args = this._rewriteArgs(process.argv.slice(2));
    if (args.find((i) => i === SHORTCUT + "h" || i === OPTION + "help")) {
      this._logUsageThenExit(0);
      return {};
    }

    const result = this._parseArgs(args);

    for (const arg of this.config.args) {
      if (!(arg.name in result)) {
        if (arg.default === undefined) {
          throw new Error("Missing required parameters");
        }
        result[arg.name] = arg.default;
      }
    }

    for (const arg of this.config.opts) {
      if (!(arg.name in result) && arg.default !== undefined) {
        result[arg.name] = arg.default;
      }
    }

    return this._camelize(result);
  }

  _handleEnvironment() {
    const result = {};
    for (const env of this.config.envs) {
      let value;
      if (env.name in process.env) {
        value = parseValue(env.type, env.name, process.env[env.name]);
      } else if (env.default !== undefined) {
        value = env.default;
      } else {
        throw new Error(`Missing required environment variable ${env.name}`);
      }
      result[env.name] = value;
    }

    return result;
  }

  logUsage() {
    const multiple = this.config.multiple;
    let argNames = this.config.args
      .map((arg) => (arg.default === undefined ? arg.name : `[${arg.name}]`))
      .join(" ");

    if (multiple) {
      argNames += ` ${multiple.name} [...]`;
    }

    const fileName = path.basename(process.argv[1]);
    console.log(`Usage: node ${fileName} [options] ${argNames}`);

    console.log(`\n${this.description}`);

    console.log("\nPositional arguments:");
    for (const arg of this.config.args) {
      console.log(
        `  ${arg.name.padEnd(PAD)}${arg.description}${logDefault(arg)}`
      );
    }

    if (multiple) {
      console.log(`  ${multiple.name.padEnd(PAD)}${multiple.description}`);
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

  _logUsageThenExit(exitCode) {
    this.logUsage();
    process.exit(exitCode);
  }

  validate() {
    try {
      return { ...this._handleArgs(), ...this._handleEnvironment() };
    } catch (error) {
      console.error(error.message);
      this._logUsageThenExit(1);
    }
  }
}

module.exports = UserInput;
