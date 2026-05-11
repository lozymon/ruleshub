import * as http from "node:http";
import * as https from "node:https";
import { URL } from "node:url";
import { lookup as dnsLookup, LookupAddress } from "node:dns";

// Reserved/private IPv4 octet checks. Each tuple is a range [start, end]
// inclusive on the first octet; finer checks for sub-ranges live inline.
const PRIVATE_IPV4_FIRST_OCTETS = new Set([
  0, // 0.0.0.0/8 — "this network"
  10, // 10.0.0.0/8 — private
  127, // 127.0.0.0/8 — loopback
]);

function isPrivateIPv4(a: number, b: number, _c: number, _d: number): boolean {
  if (PRIVATE_IPV4_FIRST_OCTETS.has(a)) return true;
  if (a === 169 && b === 254) return true; // link-local
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 192 && b === 0 && _c === 0) return true; // IETF protocol
  if (a === 192 && b === 0 && _c === 2) return true; // TEST-NET-1
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a === 198 && b === 51 && _c === 100) return true; // TEST-NET-2
  if (a === 203 && b === 0 && _c === 113) return true; // TEST-NET-3
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast (224-239) and reserved (240-255)
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::" || lower === "::1") return true;
  // IPv4-mapped IPv6: ::ffff:a.b.c.d — let the caller re-check as v4.
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) {
    const parts = mapped[1].split(".").map(Number);
    return isPrivateIPv4(parts[0], parts[1], parts[2], parts[3]);
  }
  // fc00::/7 (Unique Local Addresses) — first byte fc or fd.
  if (/^f[cd]/.test(lower)) return true;
  // fe80::/10 (link-local) — fe80 .. febf.
  if (/^fe[89ab]/.test(lower)) return true;
  // ff00::/8 (multicast).
  if (lower.startsWith("ff")) return true;
  // 2001:db8::/32 (documentation).
  if (lower.startsWith("2001:db8:")) return true;
  return false;
}

export function isPrivateIp(ip: string): boolean {
  if (ip.includes(":")) return isPrivateIPv6(ip);
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
  return isPrivateIPv4(parts[0], parts[1], parts[2], parts[3]);
}

export class PrivateAddressError extends Error {
  constructor(public readonly address: string) {
    super(`Refusing to connect to private/reserved address ${address}`);
    this.name = "PrivateAddressError";
  }
}

export interface SafeRequestResult {
  statusCode: number | null;
  ok: boolean;
}

// POSTs a JSON body to `url`, but only after every address `hostname` resolves
// to passes `isPrivateIp`. DNS is resolved exactly once and the resulting IP
// is pinned into the socket — fetch()'s separate re-resolution opened a
// DNS-rebinding window, this closes it. Hostname is preserved for SNI and
// TLS certificate validation.
export function safePostJson(
  urlStr: string,
  headers: Record<string, string>,
  body: string,
  timeoutMs: number,
): Promise<SafeRequestResult> {
  return new Promise((resolve, reject) => {
    let url: URL;
    try {
      url = new URL(urlStr);
    } catch {
      return reject(new Error(`Invalid webhook URL: ${urlStr}`));
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return reject(new Error(`Unsupported scheme: ${url.protocol}`));
    }

    const mod = url.protocol === "https:" ? https : http;

    const req = mod.request({
      method: "POST",
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      headers: {
        "Content-Length": Buffer.byteLength(body).toString(),
        ...headers,
      },
      timeout: timeoutMs,
      lookup: (hostname, _options, callback) => {
        dnsLookup(hostname, { all: true, family: 0 }, (err, addresses) => {
          if (err) return callback(err, "", 0);
          const arr: LookupAddress[] = Array.isArray(addresses)
            ? addresses
            : [addresses as LookupAddress];
          for (const a of arr) {
            if (isPrivateIp(a.address)) {
              return callback(new PrivateAddressError(a.address), "", 0);
            }
          }
          const first = arr[0];
          callback(null, first.address, first.family);
        });
      },
    });

    req.on("response", (res) => {
      // Drain so the socket can close.
      res.resume();
      resolve({ statusCode: res.statusCode ?? null, ok: isOk(res.statusCode) });
    });
    req.on("timeout", () => req.destroy(new Error("Webhook request timeout")));
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function isOk(status: number | undefined): boolean {
  return status !== undefined && status >= 200 && status < 300;
}
