// GM I hate JS
export const match = (a, b, caseIncensitive = true) => {
  if (a === null || a === undefined) return false;

  if (Array.isArray(b)) {
    if (caseIncensitive) {
      return b.map((x) => x.toLowerCase()).includes(a.toLowerCase());
    }

    return b.includes(a);
  }

  if (caseIncensitive) {
    return a.toLowerCase() === b.toLowerCase();
  }

  return a === b;
};

// JSON.stringify from ethers.BigNumber is pretty horrendous
// So we have a custom stringify functino
export const stringifyBN = (o, toHex = false) => {
  if (o === null || o === undefined) {
    return o;
  } else if (typeof o == "bigint" || o.eq !== undefined) {
    if (toHex) {
      return o.toHexString();
    }
    return o.toString();
  } else if (Array.isArray(o)) {
    return o.map((x) => stringifyBN(x, toHex));
  } else if (typeof o == "object") {
    const res = {};
    const keys = Object.keys(o);
    keys.forEach((k) => {
      res[k] = stringifyBN(o[k], toHex);
    });
    return res;
  } else {
    return o;
  }
};
