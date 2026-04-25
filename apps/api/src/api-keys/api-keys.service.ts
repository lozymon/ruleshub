import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { CreateApiKeyDto } from "./dto/create-api-key.dto";

const KEY_PREFIX = "rhk_";

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateApiKeyDto) {
    const raw = `${KEY_PREFIX}${randomBytes(32).toString("hex")}`;
    const prefix = raw.slice(0, 12);
    const keyHash = hashKey(raw);

    const apiKey = await this.prisma.apiKey.create({
      data: { userId, name: dto.name, keyHash, prefix },
    });

    this.logger.log(`API key created for user ${userId}: ${apiKey.id}`);

    return {
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      lastUsedAt: null,
      createdAt: apiKey.createdAt.toISOString(),
      key: raw,
    };
  }

  async list(userId: string) {
    const keys = await this.prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return keys.map((k) => ({
      id: k.id,
      name: k.name,
      prefix: k.prefix,
      lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
      createdAt: k.createdAt.toISOString(),
    }));
  }

  async revoke(userId: string, keyId: string) {
    const key = await this.prisma.apiKey.findUnique({ where: { id: keyId } });
    if (!key) throw new NotFoundException("API key not found");
    if (key.userId !== userId) throw new ForbiddenException();
    await this.prisma.apiKey.delete({ where: { id: keyId } });
  }

  async validateKey(raw: string) {
    if (!raw.startsWith(KEY_PREFIX)) return null;
    const keyHash = hashKey(raw);
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyHash },
      include: { user: true },
    });
    if (!apiKey) return null;

    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return apiKey.user;
  }
}
