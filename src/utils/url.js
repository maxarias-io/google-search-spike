/*
 * Functions for parsing URLs
 */

const ignoredSubdomainsRegex =
  /^(?:www[0-9]*|m|shop|secure|pay|checkout|order|us|na|app|ecom|reservations?|store|webstore|purchase|book|res|memberservices|use|my)\.([^.]+\.)/;
const ignoredSubdomainComponentsRegex = /^(?:secure-)([^.]+)\.([^.]+\.)/;

function domainFromUrl(uri, preserveSubdomain = false) {
  if (!uri) {
    return undefined;
  }

  const { hostname } = new URL(uri);
  if (preserveSubdomain) {
    return hostname.replace(ignoredSubdomainComponentsRegex, "$1.$2");
  }

  return hostname
    .replace(ignoredSubdomainComponentsRegex, "$1.$2")
    .replace(ignoredSubdomainsRegex, "$1");
}

export { domainFromUrl };
