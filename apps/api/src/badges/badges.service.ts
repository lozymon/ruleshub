import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const CHAR_W = 6.5;
const PAD = 5;
const H = 20;

function textWidth(text: string): number {
  return Math.round(text.length * CHAR_W);
}

function sectionWidth(text: string): number {
  return textWidth(text) + PAD * 2;
}

function badge(label: string, value: string, color: string): string {
  const lw = sectionWidth(label);
  const rw = sectionWidth(value);
  const total = lw + rw;

  // SVG text is rendered at scale(.1) with font-size 110, so coordinates are ×10
  const lx = Math.round((lw / 2) * 10);
  const rx = Math.round((lw + rw / 2) * 10);
  const ltw = Math.max(1, (textWidth(label) - 1) * 10);
  const rtw = Math.max(1, (textWidth(value) - 1) * 10);

  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${H}" role="img" aria-label="${esc(label)}: ${esc(value)}">
  <title>${esc(label)}: ${esc(value)}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${total}" height="${H}" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${lw}" height="${H}" fill="#555"/>
    <rect x="${lw}" width="${rw}" height="${H}" fill="${color}"/>
    <rect width="${total}" height="${H}" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text aria-hidden="true" x="${lx}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${ltw}" lengthAdjust="spacing">${esc(label)}</text>
    <text x="${lx}" y="140" transform="scale(.1)" textLength="${ltw}" lengthAdjust="spacing">${esc(label)}</text>
    <text aria-hidden="true" x="${rx}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${rtw}" lengthAdjust="spacing">${esc(value)}</text>
    <text x="${rx}" y="140" transform="scale(.1)" textLength="${rtw}" lengthAdjust="spacing">${esc(value)}</text>
  </g>
</svg>`;
}

@Injectable()
export class BadgesService {
  constructor(private readonly prisma: PrismaService) {}

  async versionBadge(namespace: string, name: string): Promise<string> {
    const pkg = await this.prisma.package.findUnique({
      where: { namespace_name: { namespace, name } },
      include: { versions: { orderBy: { publishedAt: "desc" }, take: 1 } },
    });

    if (!pkg || pkg.versions.length === 0) {
      return badge("ruleshub", "not found", "#9f9f9f");
    }

    return badge("ruleshub", `v${pkg.versions[0].version}`, "#007ec6");
  }

  async downloadsBadge(namespace: string, name: string): Promise<string> {
    const pkg = await this.prisma.package.findUnique({
      where: { namespace_name: { namespace, name } },
    });

    if (!pkg) {
      return badge("downloads", "not found", "#9f9f9f");
    }

    const n = pkg.totalDownloads;
    const value =
      n >= 1_000_000
        ? `${(n / 1_000_000).toFixed(1)}M`
        : n >= 1_000
          ? `${(n / 1_000).toFixed(1)}k`
          : String(n);

    return badge("downloads", value, "#4c1");
  }
}
