function envStr(value: any, fallback?: string) {
  if (value === undefined) {
    if (fallback === undefined) {
      throw new Error("undefined value");
    } else {
      return fallback;
    }
  }
  return value;
}

function envBool(value: any, fallback?: boolean) {
  if (value === undefined) {
    if (fallback === undefined) {
      throw new Error("undefined value");
    } else {
      return fallback;
    }
  }
  if (value === "true") {
    return true;
  } else if (value === "false") {
    return false;
  }
  throw new Error("invalid boolean value");
}

function envFloat(value: any, fallback?: number) {
  if (value === undefined) {
    if (fallback === undefined) {
      throw new Error("undefined value");
    } else {
      return fallback;
    }
  }
  const floatValue = parseFloat(value);
  if (isNaN(floatValue)) {
    throw new Error("invalid float value");
  }
  return floatValue;
}

function envInt(value: any, fallback?: number) {
  if (value === undefined) {
    if (fallback === undefined) {
      throw new Error("undefined value");
    } else {
      return fallback;
    }
  }
  const intValue = parseInt(value);
  if (isNaN(intValue)) {
    throw new Error("invalid integer value");
  }
  return intValue;
}

export { envStr, envInt, envFloat, envBool };
