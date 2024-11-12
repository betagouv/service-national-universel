function envStr(source: object, key: string, fallback: string | undefined) {
  const v = source[key];
  if (v === undefined) {
    if (fallback === undefined) {
      console.error(`Environment variable ${key} is not defined`);
      return undefined;
    } else {
      return fallback;
    }
  }
  return v;
}

function envBool(source: object, key: string, fallback: boolean | undefined) {
  const v = source[key];
  if (v === undefined) {
    if (fallback === undefined) {
      console.error(`Environment variable ${key} is not defined`);
      return undefined;
    } else {
      return fallback;
    }
  }
  if (v === "true") {
    return true;
  } else if (v === "false") {
    return false;
  }
  console.error(`Environment variable ${key} is not a valid boolean (true|false)`);
  return undefined;
}

function envFloat(source: object, key: string, fallback: number | undefined) {
  let v = source[key];
  if (v === undefined) {
    if (fallback === undefined) {
      console.error(`Environment variable ${key} is not defined`);
      return undefined;
    } else {
      return fallback;
    }
  }
  v = parseFloat(v);
  if (isNaN(v)) {
    console.error(`Environment variable ${key} is not a valid float`);
    return undefined;
  }
  return v;
}

function envInt(source: object, key: string, fallback: number | undefined) {
  let v = source[key];
  if (v === undefined) {
    if (fallback === undefined) {
      console.error(`Environment variable ${key} is not defined`);
      return undefined;
    } else {
      return fallback;
    }
  }
  v = parseInt(v);
  if (isNaN(v)) {
    console.error(`Environment variable ${key} is not a valid integer`);
    return undefined;
  }
  return v;
}

export { envStr, envInt, envFloat, envBool };
