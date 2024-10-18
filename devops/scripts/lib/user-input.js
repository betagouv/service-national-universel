const { env, argv } = require("node:process");

const STRING = "str";
const INTEGER = "int";
const BOOLEAN = "bool";

function parseBool(input) {
  if (input === "1" || input === "true") {
    return true;
  } else if (input === "0" || input === "false") {
    return false;
  }
  return null;
}

function parseItem(name, value, type, defaultValue) {
  let _value = value;
  if (!_value) {
    if (defaultValue === undefined) {
      throw new Error(`${name} is not set`);
    } else {
      _value = defaultValue;
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
  constructor() {
    this.args = [];
    this.opts = [];
    this.optsIndex = {};
    this.envs = [];
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

  _env(type, name, description, defaultValue) {
    this.envs.push({ type, name, description, default: defaultValue });
    return this;
  }

  env(name, description, defaultValue) {
    return this._env(STRING, name, description, defaultValue);
  }

  envBool(name, description, defaultValue) {
    return this._env(BOOLEAN, name, description, defaultValue);
  }

  parse() {
    const result = {};
    for (const e of this.envs) {
      result[e.name] = parseItem(e.name, env[e.name], e.type, e.default);
    }
    for (const arg of argv.slice(2)) {
      if (arg.startsWith("-")) {
        const { key, value } = parseOption(arg);
        const option = this.optsIndex[key];
        if (option) {
          result[option.name] = parseItem(
            option.name,
            value,
            option.type,
            option.default
          );
        } else {
          throw new Error(`Bad option: ${key}`);
        }
      }
    }
    return result;
  }
}

module.exports = UserInput;
