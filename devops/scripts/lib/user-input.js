const process = require("node:process");
const path = require("node:path");

const STRING = "str";
const INTEGER = "int";
const BOOLEAN = "bool";

const PAD = 40;
const OPTION = "--";

function parseBool(input) {
  if (input === "1" || input === "true") {
    return true;
  } else if (input === "0" || input === "false") {
    return false;
  }
  return null;
}

function parseItem(type, name, value) {
  let _value = value;
  if (!_value) {
    throw new Error(`${name} is not set`);
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

class UserInput {
  constructor(description) {
    this.description = description;
    this.args = [];
    this.opts = [];
    this.envs = [];
    this.optBool("help", "Print command-line options");
  }

  _arg(type, name, description) {
    if (!name.match(KEBAB_CASE_PATTERN)) {
      throw new Error(`Invalid format for ${name} : kebab-case expected`);
    }
    this.args.push({ type, name, description });
    return this;
  }

  arg(name, description) {
    return this._arg(STRING, name, description);
  }

  argInt(name, description) {
    return this._arg(INTEGER, name, description);
  }

  _opt(type, name, description) {
    if (!name.match(KEBAB_CASE_PATTERN)) {
      throw new Error(`Invalid format for ${name} : kebab-case expected`);
    }
    this.opts.push({ type, name, description });
    return this;
  }

  option(name, description) {
    return this._opt(STRING, name, description);
  }

  optInt(name, description) {
    return this._opt(INTEGER, name, description);
  }

  optBool(name, description) {
    return this._opt(BOOLEAN, name, description);
  }

  _env(type, name, description) {
    if (!name.match(ENV_PATTERN)) {
      throw new Error(`Invalid format for ${name} : identifier case expected`);
    }
    this.envs.push({ type, name, description });
    return this;
  }

  env(name, description) {
    return this._env(STRING, name, description);
  }

  envBool(name, description) {
    return this._env(BOOLEAN, name, description);
  }

  _parseEnvironment(source, result) {
    for (const env of this.envs) {
      result[env.name] = parseItem(env.type, env.name, source[env.name]);
    }
  }

  _parseOptions(source, result) {
    for (const item of source) {
      const { name, value } = parseOption(item);
      const option = this.opts.find((i) => OPTION + i.name === name);
      if (option) {
        const key = camelize(option.name);
        result[key] = parseItem(option.type, name, value);
      } else {
        throw new Error(`Invalid option: ${name}`);
      }
    }
  }

  _parsePositionals(source, result) {
    if (source.length < this.args.length) {
      throw new Error("Required arguments are missing");
    }
    if (source.length > this.args.length) {
      throw new Error("Too much arguments were provided");
    }
    let i = 0;
    for (const arg of this.args) {
      const item = source[i];
      const key = camelize(arg.name);
      result[key] = parseItem(arg.type, arg.name, item);
      i += 1;
    }
  }

  logUsage() {
    const argNames = this.args.map((arg) => "<" + arg.name + ">").join(" ");
    const fileName = path.basename(process.argv[1]);
    console.log(`Usage: node ${fileName} ${argNames}`);

    console.log(`\n${this.description}`);

    console.log("\nPositional arguments:");
    for (const arg of this.args) {
      console.log(`  ${arg.name.padEnd(PAD)}${arg.description}`);
    }

    console.log("\nOptions:");
    for (const option of this.opts) {
      let name = OPTION + option.name;
      if (option.type !== BOOLEAN) {
        name += "=...";
      }
      console.log(`  ${name.padEnd(PAD)}${option.description}`);
    }

    console.log("\nEnvironment variables:");
    for (const env of this.envs) {
      console.log(`  ${env.name.padEnd(PAD)}${env.description}`);
    }
  }

  _parse() {
    const result = {};

    this._parseEnvironment(process.env, result);

    const args = process.argv.slice(2);

    const options = args.filter((arg) => arg.startsWith(OPTION));
    this._parseOptions = this._parseOptions(options, result);

    const positionals = args.filter((arg) => !arg.startsWith(OPTION));
    this._parsePositionals = this._parsePositionals(positionals, result);

    return result;
  }

  validate() {
    try {
      const result = this._parse();
      if (result["help"]) {
        this.logUsage();
        process.exit(0);
      }
      return result;
    } catch (error) {
      console.error(error.message);
      this.logUsage();
      process.exit(1);
    }
  }
}

module.exports = UserInput;
