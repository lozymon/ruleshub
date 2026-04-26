import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { createHmac, randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { CreateWebhookDto } from "./dto/create-webhook.dto";
import type { WebhookEvent } from "@ruleshub/types";

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateWebhookDto) {
    const [namespace, name] = dto.packageFullName.split("/");
    const pkg = await this.prisma.package.findUnique({
      where: { namespace_name: { namespace, name } },
    });
    if (!pkg)
      throw new NotFoundException(`Package ${dto.packageFullName} not found`);

    const secret = `whsec_${randomBytes(32).toString("hex")}`;

    try {
      const webhook = await this.prisma.webhook.create({
        data: { userId, packageId: pkg.id, url: dto.url, secret },
        include: { package: true },
      });
      return this.toDto(webhook, true);
    } catch (e: unknown) {
      if (
        typeof e === "object" &&
        e !== null &&
        "code" in e &&
        (e as { code: string }).code === "P2002"
      ) {
        throw new ConflictException(
          "Webhook for this package and URL already exists",
        );
      }
      throw e;
    }
  }

  async list(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.webhook.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { package: true },
      }),
      this.prisma.webhook.count({ where: { userId } }),
    ]);
    return { data: data.map((w) => this.toDto(w, false)), total, page, limit };
  }

  async remove(userId: string, id: string) {
    const webhook = await this.prisma.webhook.findUnique({ where: { id } });
    if (!webhook) throw new NotFoundException("Webhook not found");
    if (webhook.userId !== userId) throw new ForbiddenException();
    await this.prisma.webhook.delete({ where: { id } });
  }

  async listDeliveries(
    userId: string,
    webhookId: string,
    page = 1,
    limit = 20,
  ) {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id: webhookId },
    });
    if (!webhook) throw new NotFoundException("Webhook not found");
    if (webhook.userId !== userId) throw new ForbiddenException();

    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.webhookDelivery.findMany({
        where: { webhookId },
        skip,
        take: limit,
        orderBy: { attemptedAt: "desc" },
      }),
      this.prisma.webhookDelivery.count({ where: { webhookId } }),
    ]);

    return {
      data: data.map((d) => ({
        id: d.id,
        event: d.event,
        statusCode: d.statusCode,
        success: d.success,
        attemptedAt: d.attemptedAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async ping(userId: string, webhookId: string) {
    const webhook = await this.prisma.webhook.findUnique({
      where: { id: webhookId },
      include: { package: true },
    });
    if (!webhook) throw new NotFoundException("Webhook not found");
    if (webhook.userId !== userId) throw new ForbiddenException();

    const payload = {
      event: "ping" as const,
      timestamp: new Date().toISOString(),
      package: `${webhook.package.namespace}/${webhook.package.name}`,
    };

    await this.deliver(
      webhook.id,
      webhook.url,
      webhook.secret,
      "ping",
      payload,
    );
    return { ok: true };
  }

  // Called fire-and-forget from PackagesService — never throws
  fireForPackage(
    event: WebhookEvent,
    packageId: string,
    packageFullName: string,
    version: string,
  ): void {
    this.prisma.webhook
      .findMany({ where: { packageId, active: true } })
      .then((webhooks) => {
        const payload = {
          event,
          timestamp: new Date().toISOString(),
          package: packageFullName,
          version,
        };
        for (const wh of webhooks) {
          this.deliver(wh.id, wh.url, wh.secret, event, payload).catch(
            (err: unknown) => {
              this.logger.error(
                `Webhook delivery failed for ${wh.id}: ${String(err)}`,
              );
            },
          );
        }
      })
      .catch((err: unknown) => {
        this.logger.error(
          `Failed to load webhooks for package ${packageId}: ${String(err)}`,
        );
      });
  }

  private async deliver(
    webhookId: string,
    url: string,
    secret: string,
    event: string,
    payload: Record<string, unknown>,
  ) {
    const body = JSON.stringify(payload);
    const sig = createHmac("sha256", secret).update(body).digest("hex");

    let statusCode: number | null = null;
    let success = false;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RulesHub-Event": event,
          "X-RulesHub-Signature": `sha256=${sig}`,
        },
        body,
        signal: AbortSignal.timeout(10_000),
      });
      statusCode = res.status;
      success = res.ok;
    } catch {
      success = false;
    }

    await this.prisma.webhookDelivery.create({
      data: {
        webhookId,
        event,
        payload: payload as Prisma.InputJsonValue,
        statusCode,
        success,
      },
    });

    return { statusCode, success };
  }

  private toDto(
    webhook: {
      id: string;
      url: string;
      secret: string;
      active: boolean;
      createdAt: Date;
      package: { namespace: string; name: string };
    },
    includeSecret: boolean,
  ) {
    return {
      id: webhook.id,
      url: webhook.url,
      packageFullName: `${webhook.package.namespace}/${webhook.package.name}`,
      active: webhook.active,
      createdAt: webhook.createdAt.toISOString(),
      ...(includeSecret && { secret: webhook.secret }),
    };
  }
}
