/*
 * Hashing algorithms
 */

/* eslint-disable no-bitwise */

function joaat(value, base = 36) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash += value.charCodeAt(i);
    hash += hash << 10;
    hash ^= hash >> 6;
  }
  hash += hash << 3;
  hash ^= hash >> 11;
  hash += hash << 15;
  if (hash < 0) {
    hash = 0xffffffff + hash + 1;
  }
  return parseInt(String(hash), 10).toString(base);
}

/* eslint-enable no-bitwise */

export { joaat };
