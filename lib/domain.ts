const DOMAIN_PATTERN =
  /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export function normalizeDomain(input: string) {
  const trimmed = input.trim().toLowerCase();

  if (!trimmed) {
    return "";
  }

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    const hostname = url.hostname.replace(/^www\./, "");

    if (!DOMAIN_PATTERN.test(hostname)) {
      return "";
    }

    return hostname;
  } catch {
    return "";
  }
}

export function domainToUrl(domain: string) {
  return `https://${domain}`;
}

