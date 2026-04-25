import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { PackagesService } from "../packages/packages.service";
import { CreateImportDto } from "./dto/create-import.dto";
import { PackageManifestSchema } from "@ruleshub/types";
import type { GitHubImportCreatedDto, GitHubImportDto } from "@ruleshub/types";

function parseGitHubUrl(url: string): { owner: string; repo: string } {
  const match = url.match(/github\.com\/([^/]+)\/([^/.]+)/);
  if (!match) throw new BadRequestException("Invalid GitHub repository URL");
  return { owner: match[1], repo: match[2] };
}

function toDto(
  imp: {
    id: string;
    repoUrl: string;
    lastSyncedAt: Date | null;
    createdAt: Date;
    package: { namespace: string; name: string };
  },
  webhookSecret?: string,
): GitHubImportDto | GitHubImportCreatedDto {
  const base: GitHubImportDto = {
    id: imp.id,
    repoUrl: imp.repoUrl,
    packageFullName: `${imp.package.namespace}/${imp.package.name}`,
    lastSyncedAt: imp.lastSyncedAt?.toISOString() ?? null,
    createdAt: imp.createdAt.toISOString(),
  };
  if (webhookSecret !== undefined) return { ...base, webhookSecret };
  return base;
}

@Injectable()
export class ImportsService {
  private readonly logger = new Logger(ImportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly packagesService: PackagesService,
  ) {}

  async create(
    userId: string,
    dto: CreateImportDto,
  ): Promise<GitHubImportCreatedDto> {
    const { owner, repo } = parseGitHubUrl(dto.repoUrl);

    // Fetch and validate ruleshub.json from the repo's default branch
    const manifestRaw = await this.fetchManifest(owner, repo);
    const parsed = PackageManifestSchema.safeParse(manifestRaw);
    if (!parsed.success) {
      throw new BadRequestException(
        "ruleshub.json in repository is invalid: " +
          JSON.stringify(parsed.error.flatten()),
      );
    }

    const [namespace, packageName] = parsed.data.name.split("/");

    // Validate the caller has publish rights for this namespace
    await this.assertOwnership(userId, namespace);

    const webhookSecret = randomBytes(20).toString("hex");

    const ghImport = await this.prisma.$transaction(async (tx) => {
      // Upsert the package (without a version — versions come from webhook tags)
      const pkg = await tx.package.upsert({
        where: { namespace_name: { namespace, name: packageName } },
        update: {},
        create: {
          namespace,
          name: packageName,
          type: parsed.data.type,
          description: parsed.data.description,
          tags: parsed.data.tags,
          projectTypes: parsed.data.projectTypes,
          supportedTools: parsed.data.targets
            ? Object.keys(parsed.data.targets)
            : [],
          ownerType: "user",
          ownerUserId: userId,
        },
      });

      return tx.gitHubImport.upsert({
        where: { packageId: pkg.id },
        update: { repoUrl: dto.repoUrl, webhookSecret },
        create: { packageId: pkg.id, repoUrl: dto.repoUrl, webhookSecret },
        include: { package: true },
      });
    });

    return toDto(ghImport, webhookSecret) as GitHubImportCreatedDto;
  }

  async findMine(userId: string): Promise<GitHubImportDto[]> {
    const imports = await this.prisma.gitHubImport.findMany({
      where: { package: { ownerUserId: userId } },
      include: { package: true },
      orderBy: { createdAt: "desc" },
    });
    return imports.map((i) => toDto(i) as GitHubImportDto);
  }

  async remove(userId: string, namespace: string, name: string): Promise<void> {
    const pkg = await this.prisma.package.findUnique({
      where: { namespace_name: { namespace, name } },
    });
    if (!pkg) throw new NotFoundException("Package not found");
    if (pkg.ownerUserId !== userId) throw new ForbiddenException();

    await this.prisma.gitHubImport.delete({ where: { packageId: pkg.id } });
  }

  async handleWebhook(
    importId: string,
    signature: string | undefined,
    rawBody: Buffer,
  ): Promise<void> {
    const ghImport = await this.prisma.gitHubImport.findUnique({
      where: { id: importId },
      include: { package: true },
    });
    if (!ghImport) return;

    this.validateSignature(rawBody, signature, ghImport.webhookSecret);

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody.toString()) as Record<string, unknown>;
    } catch {
      throw new BadRequestException("Invalid JSON payload");
    }

    // Only process tag pushes
    const ref = payload["ref"];
    if (typeof ref !== "string" || !ref.startsWith("refs/tags/")) return;

    const tagName = ref.replace("refs/tags/", "");
    const { owner, repo } = parseGitHubUrl(ghImport.repoUrl);

    this.logger.log(
      `Syncing ${ghImport.package.namespace}/${ghImport.package.name} tag ${tagName}`,
    );

    const zipBuffer = await this.fetchTagZip(owner, repo, tagName);

    const ownerUserId = ghImport.package.ownerUserId;
    if (!ownerUserId) {
      this.logger.warn(
        `Import ${importId} has no ownerUserId — skipping (org-owned packages not yet supported for imports)`,
      );
      return;
    }

    await this.packagesService.publishFromWebhook(ownerUserId, zipBuffer);

    await this.prisma.gitHubImport.update({
      where: { id: importId },
      data: { lastSyncedAt: new Date() },
    });
  }

  private validateSignature(
    rawBody: Buffer,
    signature: string | undefined,
    secret: string,
  ): void {
    if (!signature) throw new ForbiddenException("Missing webhook signature");

    const expected =
      "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);

    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      throw new ForbiddenException("Invalid webhook signature");
    }
  }

  private async fetchManifest(owner: string, repo: string): Promise<unknown> {
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/ruleshub.json`;
    const res = await fetch(url, { headers: { "User-Agent": "RulesHub/1.0" } });
    if (!res.ok) {
      throw new BadRequestException(
        "Could not fetch ruleshub.json — ensure the repo is public and contains ruleshub.json on the default branch",
      );
    }
    try {
      return await res.json();
    } catch {
      throw new BadRequestException(
        "ruleshub.json in repository is not valid JSON",
      );
    }
  }

  private async fetchTagZip(
    owner: string,
    repo: string,
    tag: string,
  ): Promise<Buffer> {
    const url = `https://api.github.com/repos/${owner}/${repo}/zipball/refs/tags/${tag}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "RulesHub/1.0",
        Accept: "application/vnd.github+json",
      },
      redirect: "follow",
    });
    if (!res.ok) {
      throw new BadRequestException(
        `Failed to fetch zip for tag ${tag} from GitHub (${res.status})`,
      );
    }
    return Buffer.from(await res.arrayBuffer());
  }

  private async assertOwnership(
    userId: string,
    namespace: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException("User not found");
    if (user.username === namespace) return;

    const orgMember = await this.prisma.orgMember.findFirst({
      where: { userId, org: { slug: namespace } },
    });
    if (!orgMember) {
      throw new ForbiddenException(
        `You do not have permission to publish under ${namespace}`,
      );
    }
  }
}
