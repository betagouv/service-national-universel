const process = require("node:process");
const path = require("node:path");

const STRING = "str";
const INTEGER = "int";
const BOOLEAN = "bool";

const PAD = 40;

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
      key: arg,
      value: "true",
    };
  } else {
    return {
      key: arg.substring(0, index),
      value: arg.substring(index + 1),
    };
  }
}

class UserInput {
  constructor(description) {
    this.description = description;
    this.args = [];
    this.opts = [];
    this.optsIndex = {};
    this.envs = [];
    this.optBool("help", ["-h", "--help"], "Print command-line options");
  }

  _arg(type, name, description) {
    this.args.push({ type, name, description });
    return this;
  }

  arg(name, description) {
    return this._arg(STRING, name, description);
  }

  argInt(name, description) {
    return this._arg(INTEGER, name, description);
  }

  _opt(type, name, keys, description) {
    const option = { type, name, keys, description };
    for (const key of keys) {
      this.optsIndex[key] = option;
    }
    this.opts.push(option);
    return this;
  }

  option(name, keys, description) {
    return this._opt(STRING, name, keys, description);
  }

  optInt(name, keys, description) {
    return this._opt(INTEGER, name, keys, description);
  }

  optBool(name, keys, description) {
    return this._opt(BOOLEAN, name, keys, description);
  }

  _env(type, name, description) {
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
      const { key, value } = parseOption(item);
      const option = this.optsIndex[key];
      if (option) {
        result[option.name] = parseItem(option.type, option.name, value);
      } else {
        throw new Error(`Invalid option: ${key}`);
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
      result[arg.name] = parseItem(arg.type, arg.name, item);
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
      console.log(
        `  ${option.keys.join(", ").padEnd(PAD)}${option.description}`
      );
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

    const options = args.filter((arg) => arg.startsWith("-"));
    this._parseOptions = this._parseOptions(options, result);

    const positionals = args.filter((arg) => !arg.startsWith("-"));
    this._parsePositionals = this._parsePositionals(positionals, result);

    return result;
  }

  validate() {
    try {
      const result = this._parse();
      if ("help" in result) {
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
